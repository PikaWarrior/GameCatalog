import React, { useMemo, useCallback, lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import TagFilter from './components/TagFilter';
import LoadingSkeleton from './components/LoadingSkeleton';
import GameModal from './components/GameModal';
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sanitizeGameData } from './utils/sanitize';
import { Game, ProcessedGame, FilterState } from './types';
import './styles/App.css';
import './styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/FinalGameLib_WithSimilar.json';

const GameGrid = lazy(() => import('./components/GameGrid'));

function App() {
  const games: Game[] = useMemo(() => {
    return (rawGamesData as any[]).map(game => sanitizeGameData(game));
  }, []);

  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  const [filterState, setFilterState] = useLocalStorage<FilterState>('gameFilters_v10', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  // --- ЛОГИКА ОБРАБОТКИ ДАННЫХ (ОСТАВЛЯЕМ НОВУЮ) ---
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

      const similarText = game.similar_games?.map(s => s.name).join(' ') || '';

      return {
        ...game,
        id: game.id || `game-${index}-${game.name.toLowerCase().replace(/\s+/g, '-')}`,
        searchableText: `${game.name} ${game.description} ${game.tags.join(' ')} ${game.subgenres.join(' ')} ${similarText}`.toLowerCase(),
        normalizedCoop: displayCoop,
        normalizedGenre: game.genre,
        sanitizedDescription: game.description,
      };
    });
  }, [games]);

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

  const filteredGames = useMemo(() => {
    const {
      selectedTags, excludedTags,
      selectedGenres, excludedGenres,
      selectedCoop, sortBy
    } = filterState;

    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        if (selectedTags.length > 0) {
          if (!selectedTags.every(tag => gameTags.has(tag))) return false;
        }
        if (excludedTags && excludedTags.length > 0) {
          if (excludedTags.some(tag => gameTags.has(tag))) return false;
        }
        if (excludedGenres && excludedGenres.length > 0) {
          if (excludedGenres.includes(game.genre)) return false;
        }
        if (selectedGenres && selectedGenres.length > 0) {
          if (!selectedGenres.includes(game.genre)) return false;
        }

        if (selectedCoop !== 'All') {
          const gameModes = game.coop.toLowerCase();
          const targetMode = selectedCoop.toLowerCase();

          if (targetMode === 'single') {
            const hasMultiplayer = gameModes.includes('multiplayer') || gameModes.includes('co-op') || gameModes.includes('online') || gameModes.includes('lan') || gameModes.includes('split') || gameModes.includes('shared');
            if (hasMultiplayer) return false;
          } else if (targetMode === 'split screen') {
            if (!gameModes.includes('split screen') && !gameModes.includes('splitscreen')) return false;
          } else if (targetMode === 'co-op & multiplayer') {
            if (!gameModes.includes('co-op') && !gameModes.includes('multiplayer')) return false;
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
  }, [processedGames, filterState, debouncedSearch]);

  const handleOpenModal = useCallback((game: ProcessedGame) => setSelectedGame(game), []);
  const handleCloseModal = useCallback(() => setSelectedGame(null), []);

  // Хелперы для обновления стейта
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = useCallback((tag: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedTags.includes(tag);
      const isExcluded = prev.excludedTags.includes(tag);
      let newSel = [...prev.selectedTags];
      let newExcl = [...prev.excludedTags];

      if (isSelected) {
        newSel = newSel.filter(t => t !== tag);
        newExcl.push(tag);
      } else if (isExcluded) {
        newExcl = newExcl.filter(t => t !== tag);
      } else {
        newSel.push(tag);
      }
      return { ...prev, selectedTags: newSel, excludedTags: newExcl };
    });
  }, [setFilterState]);

  const handleGenreToggle = useCallback((genre: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedGenres.includes(genre);
      const isExcluded = prev.excludedGenres.includes(genre);
      let newSel = [...prev.selectedGenres];
      let newExcl = [...prev.excludedGenres];

      if (isSelected) {
        newSel = newSel.filter(t => t !== genre);
        newExcl.push(genre);
      } else if (isExcluded) {
        newExcl = newExcl.filter(t => t !== genre);
      } else {
        newSel.push(genre);
      }
      return { ...prev, selectedGenres: newSel, excludedGenres: newExcl };
    });
  }, [setFilterState]);

  const handleResetFilters = useCallback(() => {
    setFilterState({
      searchQuery: '', selectedTags: [], excludedTags: [], selectedGenres: [], excludedGenres: [], selectedCoop: 'All', sortBy: 'name',
    });
  }, [setFilterState]);

  return (
    <div className="app-container">
      <ErrorBoundary>
        <Header 
          totalGames={filteredGames.length}
          onReset={handleResetFilters}
          hasActiveFilters={filterState.selectedTags.length > 0 || filterState.searchQuery !== ''}
        />
        
        <main className="main-content">
          <aside className="sidebar">
            {/* Контролы, которые были в дизайне, но теперь они в сайдбаре */}
            <div className="sidebar-controls">
              <div className="control-group">
                <label>Game Mode</label>
                <select 
                  className="control-select"
                  value={filterState.selectedCoop}
                  onChange={(e) => updateFilter('selectedCoop', e.target.value)}
                >
                  <option value="All">All Modes</option>
                  <option value="Single">Single Player</option>
                  <option value="Multiplayer">Multiplayer</option>
                  <option value="Co-op">Co-op</option>
                  <option value="Split Screen">Split Screen</option>
                </select>
              </div>

              <div className="control-group">
                <label>Sort By</label>
                <select 
                  className="control-select"
                  value={filterState.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="genre">Genre</option>
                  <option value="coop">Mode</option>
                </select>
              </div>
            </div>

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
              
              // Пропсы сортировки больше не нужны внутри TagFilter, мы их вынесли выше
              selectedCoop={filterState.selectedCoop}
              onCoopChange={() => {}}
              sortBy={filterState.sortBy}
              onSortChange={() => {}}
            />
          </aside>

          <section className="content-area">
            <Suspense fallback={<LoadingSkeleton count={12} />}>
              <GameGrid games={filteredGames} onOpenModal={handleOpenModal} />
            </Suspense>
          </section>
        </main>

        <GameModal game={selectedGame} onClose={handleCloseModal} />
      </ErrorBoundary>
    </div>
  );
}

export default App;
