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
import { Heart } from 'lucide-react';
import '@styles/App.css';
import '@styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/FinalGameLib_WithSimilar.json';

const GameGrid = lazy(() => import('@components/GameGrid'));

interface ExtendedFilterState extends Omit<FilterState, 'selectedGenre'> {
  excludedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  showFavorites: boolean;
  filterMode: 'AND' | 'OR'; // 🆕
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

  // 🆕 Версия v16 для нового поля filterMode
  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters_v16_FAV', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
    showFavorites: false,
    filterMode: 'AND', // 🆕 По умолчанию "Все"
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  const processedGames = useMemo(() => {
    return games.map((game, index): ProcessedGame => {
      const coopLower = game.coop.toLowerCase();
      let displayCoop = game.coop.split(' / ')[0];

      if (displayCoop === 'Single' && (
        coopLower.includes('multiplayer') ||
        coopLower.includes('co-op') ||
        coopLower.includes('online') ||
        coopLower.includes('shared') ||
        coopLower.includes('split')
      )) {
        if (coopLower.includes('multiplayer')) displayCoop = 'Multiplayer';
        else if (coopLower.includes('co-op')) displayCoop = 'Co-op';
        else if (coopLower.includes('split')) displayCoop = 'Split Screen';
        else if (coopLower.includes('online')) displayCoop = 'Online';
      }

      // 🆕 Генерация slug для ссылок
      const slug = game.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      return {
        ...game,
        id: `game-${index}-${slug}`,
        slug, // 🆕
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
      filterMode // 🆕
    } = filterState;

    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // Фильтр избранного
        if (showFavorites && !favorites.includes(game.id)) return false;

        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        // 🆕 Логика AND/OR для тегов
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

        // 🆕 Логика AND/OR для жанров
        if (selectedGenres && selectedGenres.length > 0) {
          if (filterMode === 'AND') {
            // AND для жанров (обычно игра имеет 1 основной жанр, но если массив расширится - пригодится)
            if (!selectedGenres.includes(game.genre)) return false;
          } else {
            // OR - хотя бы один из выбранных
            if (!selectedGenres.includes(game.genre)) return false;
          }
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
          }
          else if (targetMode === 'split screen') {
            if (!gameModes.includes('split screen') && !gameModes.includes('splitscreen')) return false;
          }
          else if (targetMode === 'co-op & multiplayer') {
            const hasCoop = gameModes.includes('co-op');
            const hasMulti = gameModes.includes('multiplayer');
            if (!hasCoop && !hasMulti) return false;
          }
          else if (targetMode === 'co-op & multiplayer & split screen') {
            const hasCoop = gameModes.includes('co-op');
            const hasMulti = gameModes.includes('multiplayer');
            const hasSplit = gameModes.includes('split screen') || gameModes.includes('splitscreen');
            if (!hasCoop && !hasMulti && !hasSplit) return false;
          }
          else {
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

  const handleOpenModal = useCallback((game: ProcessedGame) => setSelectedGame(game), []);
  const handleCloseModal = useCallback(() => {
    setSelectedGame(null);
    // 🆕 Очистка хеша при закрытии
    window.history.pushState(null, '', window.location.pathname + window.location.search);
  }, []);

  const handleSearchChange = useCallback((value: string) => setFilterState(p => ({ ...p, searchQuery: value })), [setFilterState]);

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
        [keyExcluded]: newExcluded
      };
    });
  };

  const handleTagToggle = useCallback((tag: string) => {
    toggleFilterItem(tag, filterState.selectedTags, filterState.excludedTags || [], 'selectedTags', 'excludedTags');
  }, [filterState]);

  const handleGenreToggle = useCallback((genre: string) => {
    toggleFilterItem(genre, filterState.selectedGenres || [], filterState.excludedGenres || [], 'selectedGenres', 'excludedGenres');
  }, [filterState]);

  const handleCoopChange = useCallback((coop: string) => setFilterState(p => ({ ...p, selectedCoop: coop })), [setFilterState]);
  const handleSortChange = useCallback((sortBy: any) => setFilterState(p => ({ ...p, sortBy })), [setFilterState]);
  const handleFavoritesToggle = useCallback(() => setFilterState(p => ({ ...p, showFavorites: !p.showFavorites })), [setFilterState]);
  
  // 🆕 Хендлер переключения режима
  const handleFilterModeToggle = useCallback((mode: 'AND' | 'OR') => {
    setFilterState(p => ({ ...p, filterMode: mode }));
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
      filterMode: 'AND', // 🆕
    });
  }, [setFilterState]);

  // 🆕 Эффект для обработки ссылок при загрузке
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const game = processedGames.find(g => g.slug === hash);
      if (game) setSelectedGame(game);
    }
  }, [processedGames]);

  useEffect(() => {
    const controller = new AbortController();
    return () => { controller.abort(); };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Header
          totalGames={games.length}
          visibleGames={filteredGames.length}
          onSearch={handleSearchChange}
          searchTerm={filterState.searchQuery}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="main-content">
          <aside className={`filters-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <div className="filters-sticky">
              <button
                className={`favorite-filter-btn ${filterState.showFavorites ? 'active' : ''}`}
                onClick={handleFavoritesToggle}
              >
                <Heart
                  size={18}
                  fill={filterState.showFavorites ? 'currentColor' : 'none'}
                  style={{ marginRight: 8 }}
                />
                {filterState.showFavorites ? 'Showing Favorites' : 'Show Favorites Only'}
              </button>

              <div className="filter-group">
                <label>Game Mode</label>
                <select
                  value={filterState.selectedCoop}
                  onChange={e => handleCoopChange(e.target.value)}
                  className="filter-select"
                >
                  {allCoopModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sort by</label>
                <select
                  value={filterState.sortBy}
                  onChange={e => handleSortChange(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="name">By name</option>
                  <option value="genre">By genre</option>
                  <option value="coop">By game mode</option>
                </select>
              </div>

              {/* 🆕 Передача пропсов режима фильтрации */}
              <TagFilter
                allGenres={allGenres}
                selectedGenres={filterState.selectedGenres}
                excludedGenres={filterState.excludedGenres}
                onGenreToggle={handleGenreToggle}
                allTags={allTags}
                allSubgenres={allSubgenres}
                selectedTags={filterState.selectedTags}
                excludedTags={filterState.excludedTags}
                onTagToggle={handleTagToggle}
                filterMode={filterState.filterMode}
                onFilterModeChange={handleFilterModeToggle}
              />

              <button className="reset-btn" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          </aside>

          <section className="games-grid-section">
            <Suspense fallback={<LoadingSkeleton />}>
              {filteredGames.length > 0 ? (
                <GameGrid
                  games={filteredGames}
                  onOpenModal={handleOpenModal}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <div className="no-results">
                  <h3>No games found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </Suspense>
          </section>
        </main>

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
