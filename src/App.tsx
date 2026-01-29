import React, { useMemo, useCallback, lazy, Suspense, useEffect, useState } from 'react';

import { ErrorBoundary } from '@components/ErrorBoundary';
import Header from '@components/Header';
import TagFilter from '@components/TagFilter';
import LoadingSkeleton from '@components/LoadingSkeleton';
import GameModal from '@components/GameModal';

import { useDebounce } from '@hooks/useDebounce';
import { useLocalStorage } from '@hooks/useLocalStorage';

import { sanitizeGameData } from '@utils/sanitize';
import { Game, ProcessedGame, FilterState, RawGame } from './types';

import '@styles/App.css';
import '@styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/FinalGameLib_WithSimilar.json';

const GameGrid = lazy(() => import('@components/GameGrid'));

// Расширяем исходный FilterState корректно
interface ExtendedFilterState extends FilterState {
  excludedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  showFavorites: boolean;
  filterMode: 'AND' | 'OR';
}

function App() {
  const games: Game[] = useMemo(() => {
    const data = Array.isArray(rawGamesData) ? rawGamesData : (rawGamesData as any).games || [];
    return (data as RawGame[]).map(game => sanitizeGameData(game));
  }, []);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  // Хранилище избранного (массив ID)
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteGames_v1', []);

  // Обновил ключ, чтобы не конфликтовать со старым кешем
  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters_v16_MODE', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
    showFavorites: false,
    filterMode: 'AND',
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  const processedGames = useMemo(() => {
    return games.map((game, index): ProcessedGame => {
      const coopLower = game.coop.toLowerCase();
      let displayCoop = game.coop.split(' / ')[0];

      if (
        displayCoop === 'Single' &&
        (
          coopLower.includes('multiplayer') ||
          coopLower.includes('co-op') ||
          coopLower.includes('online') ||
          coopLower.includes('shared') ||
          coopLower.includes('split')
        )
      ) {
        if (coopLower.includes('multiplayer')) displayCoop = 'Multiplayer';
        else if (coopLower.includes('co-op')) displayCoop = 'Co-op';
        else if (coopLower.includes('split')) displayCoop = 'Split Screen';
        else if (coopLower.includes('online')) displayCoop = 'Online';
      }

      return {
        ...game,
        id: `game-${index}-${game.name.toLowerCase().replace(/s+/g, '-')}`,
        searchableText: `${game.name} ${game.description} ${game.tags.join(' ')} ${game.subgenres.join(' ')}`.toLowerCase(),
        normalizedCoop: displayCoop,
        normalizedGenre: game.genre,
        sanitizedDescription: game.description,
      };
    });
  }, [games]);

  // --- ЛОГИКА ИЗБРАННОГО ---
  const handleToggleFavorite = useCallback((gameId: string) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      }
      return [...prev, gameId];
    });
  }, [setFavorites]);

  const allSubgenres = useMemo(() => {
    const subSet = new Set<string>();
    games.forEach(game => game.subgenres.forEach(sub => subSet.add(sub)));
    return Array.from(subSet).sort();
  }, [games]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    games.forEach(game => game.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [games]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    games.forEach(game => genres.add(game.genre));
    return Array.from(genres).sort();
  }, [games]);

  const allCoopModes = [
    'All',
    'Single',
    'Multiplayer',
    'Split Screen',
    'Co-op & Multiplayer',
    'Co-op & Multiplayer & Split Screen'
  ];

  const filteredGames = useMemo(() => {
    const {
      selectedTags, excludedTags,
      selectedGenres, excludedGenres,
      selectedCoop, sortBy, showFavorites,
      filterMode
    } = filterState;

    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // Фильтр избранного
        if (showFavorites && !favorites.includes(game.id)) return false;

        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set<string>([...game.tags, ...game.subgenres]);

        // AND/OR по тегам+поджанрам
        if (selectedTags.length > 0) {
          if (filterMode === 'AND') {
            if (!selectedTags.every(tag => gameTags.has(tag))) return false;
          } else {
            if (!selectedTags.some(tag => gameTags.has(tag))) return false;
          }
        }

        if (excludedTags && excludedTags.length > 0) {
          if (excludedTags.some(tag => gameTags.has(tag))) return false;
        }

        if (excludedGenres && excludedGenres.length > 0) {
          if (excludedGenres.includes(game.genre)) return false;
        }

        if (selectedGenres && selectedGenres.length > 0) {
          // Для жанров логика по факту одна и та же, но оставляю через filterMode для гибкости
          if (!selectedGenres.includes(game.genre)) return false;
        }

        if (selectedCoop !== 'All') {
          const gameModes = game.coop.toLowerCase();
          const targetMode = selectedCoop.toLowerCase();

          if (targetMode === 'single') {
            const hasMultiplayer =
              gameModes.includes('multiplayer') ||
              gameModes.includes('co-op') ||
              gameModes.includes('online') ||
              gameModes.includes('lan') ||
              gameModes.includes('split') ||
              gameModes.includes('shared');
            if (hasMultiplayer) return false;
          } else if (targetMode === 'split screen') {
            if (!gameModes.includes('split screen') && !gameModes.includes('splitscreen')) return false;
          } else if (targetMode === 'co-op & multiplayer') {
            const hasCoop = gameModes.includes('co-op');
            const hasMulti = gameModes.includes('multiplayer');
            if (!hasCoop && !hasMulti) return false;
          } else if (targetMode === 'co-op & multiplayer & split screen') {
            const hasCoop = gameModes.includes('co-op');
            const hasMulti = gameModes.includes('multiplayer');
            const hasSplit = gameModes.includes('split screen') || gameModes.includes('splitscreen');
            if (!hasCoop && !hasMulti && !hasSplit) return false;
          } else {
            if (!gameModes.includes(targetMode)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'genre': return a.genre.localeCompare(b.genre);
          case 'coop': return a.normalizedCoop.localeCompare(b.normalizedCoop);
          default: return 0;
        }
      });
  }, [processedGames, filterState, debouncedSearch, favorites]);

  const handleOpenModal = useCallback((game: ProcessedGame) => {
    setSelectedGame(game);
    const url = new URL(window.location.href);
    url.searchParams.set('game', game.id);
    window.history.pushState({}, '', url);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedGame(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilterState(p => ({ ...p, searchQuery: value }));
  }, [setFilterState]);

  const toggleFilterItem = (
    item: string,
    selectedList: string[],
    excludedList: string[],
    keySelected: keyof ExtendedFilterState,
    keyExcluded: keyof ExtendedFilterState
  ) => {
    setFilterState(prev => {
      const prevSelected = (prev[keySelected] as string[]) || [];
      const prevExcluded = (prev[keyExcluded] as string[]) || [];

      const isSelected = prevSelected.includes(item);
      const isExcluded = prevExcluded.includes(item);

      let newSelected = [...prevSelected];
      let newExcluded = [...prevExcluded];

      if (isSelected) {
        newSelected = newSelected.filter(t => t !== item);
        newExcluded.push(item);
      } else if (isExcluded) {
        newExcluded = newExcluded.filter(t => t !== item);
      } else {
        newSelected.push(item);
      }

      return {
        ...prev,
        [keySelected]: newSelected,
        [keyExcluded]: newExcluded,
      };
    });
  };

  const handleTagToggle = useCallback((tag: string) => {
    toggleFilterItem(tag, filterState.selectedTags, filterState.excludedTags || [], 'selectedTags', 'excludedTags');
  }, [filterState]);

  const handleGenreToggle = useCallback((genre: string) => {
    toggleFilterItem(genre, filterState.selectedGenres || [], filterState.excludedGenres || [], 'selectedGenres', 'excludedGenres');
  }, [filterState]);

  const handleCoopChange = useCallback((coop: string) => {
    setFilterState(p => ({ ...p, selectedCoop: coop }));
  }, [setFilterState]);

  const handleSortChange = useCallback((sortBy: FilterState['sortBy']) => {
    setFilterState(p => ({ ...p, sortBy }));
  }, [setFilterState]);

  const handleFavoritesToggle = useCallback(() => {
    setFilterState(p => ({ ...p, showFavorites: !p.showFavorites }));
  }, [setFilterState]);

  const handleFilterModeToggle = useCallback(() => {
    setFilterState(p => ({ ...p, filterMode: p.filterMode === 'AND' ? 'OR' : 'AND' }));
  }, [setFilterState]);

  const handleResetFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      selectedTags: [],
      excludedTags: [],
      selectedGenres: [],
      excludedGenres: [],
      selectedCoop: 'All',
      sortBy: 'name',
      showFavorites: false,
      filterMode: 'AND',
    });
  }, [setFilterState]);

  // Открытие игры из URL при первом рендере/смене processedGames
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (gameId && processedGames.length > 0) {
      const game = processedGames.find(g => g.id === gameId);
      if (game) {
        setSelectedGame(game);
      }
    }
  }, [processedGames]);

  useEffect(() => {
    const controller = new AbortController();
    return () => { controller.abort(); };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* ВАЖНО: здесь используй тот пропс-интерфейс Header, который у тебя реально описан.
           Если твой Header раньше принимал другие пропы, верни их как было. */}
        <Header
          searchQuery={filterState.searchQuery}
          onSearchChange={handleSearchChange}
          selectedCoop={filterState.selectedCoop}
          onCoopChange={handleCoopChange}
          allCoopModes={allCoopModes}
          sortBy={filterState.sortBy}
          onSortChange={handleSortChange}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          onResetFilters={handleResetFilters}
          showFavorites={filterState.showFavorites}
          onFavoritesToggle={handleFavoritesToggle}
        />

        <div className="main-content">
          {isSidebarOpen && (
            <aside className="filters-sidebar">
              <div className="filters-sticky">
                <TagFilter
                  allGenres={allGenres}
                  selectedGenres={filterState.selectedGenres || []}
                  excludedGenres={filterState.excludedGenres || []}
                  onGenreToggle={handleGenreToggle}
                  allTags={allTags}
                  allSubgenres={allSubgenres}
                  selectedTags={filterState.selectedTags}
                  excludedTags={filterState.excludedTags || []}
                  onTagToggle={handleTagToggle}
                  filterMode={filterState.filterMode}
                  onFilterModeToggle={handleFilterModeToggle}
                />
              </div>
            </aside>
          )}

          <main className="games-grid-section">
            <Suspense fallback={<LoadingSkeleton />}>
              {/* Аналогично: GameGridProps должны соответствовать тому, что у тебя было.
                 Если у тебя были другие пропы, верни их и просто добавь favorites/onToggleFavorite. */}
              <GameGrid
                games={filteredGames}
                onGameClick={handleOpenModal}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </Suspense>
          </main>
        </div>

        {selectedGame && (
          <GameModal
            game={selectedGame}
            onClose={handleCloseModal}
            isFavorite={favorites.includes(selectedGame.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedGame.id)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
