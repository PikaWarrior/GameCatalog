import React, { useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@components/ErrorBoundary';
import Header from '@components/Header';
import TagFilter from '@components/TagFilter';
import LoadingSkeleton from '@components/LoadingSkeleton';

import { useDebounce } from '@hooks/useDebounce';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { sanitizeGameData } from '@utils/sanitize';
import { Game, ProcessedGame, FilterState } from './types';

import '@styles/App.css';
import '@styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/games_data_ENRICHED_PRO.json';

const GameGrid = lazy(() => import('@components/GameGrid'));

function App() {
  const games: Game[] = useMemo(() => {
    return (rawGamesData as any[]).map(game => sanitizeGameData(game));
  }, []);

  const [filterState, setFilterState] = useLocalStorage<FilterState>('gameFilters', {
    searchQuery: '',
    selectedTags: [],
    selectedGenre: 'All',
    selectedCoop: 'All',
    sortBy: 'name',
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  const processedGames = useMemo(() => {
    return games.map((game, index): ProcessedGame => ({
      ...game,
      id: `game-${index}-${game.name.toLowerCase().replace(/\s+/g, '-')}`,
      searchableText: `${game.name} ${game.description} ${game.tags.join(' ')} ${game.subgenres.join(' ')}`.toLowerCase(),
      normalizedCoop: game.coop.split(' / ')[0],
      normalizedGenre: game.genre,
      sanitizedDescription: game.description,
    }));
  }, [games]);

  // 1. Собираем уникальные ПОДЖАНРЫ
  const allSubgenres = useMemo(() => {
    const subSet = new Set<string>();
    games.forEach(game => {
      game.subgenres.forEach(sub => subSet.add(sub));
    });
    return Array.from(subSet).sort();
  }, [games]);

  // 2. Собираем уникальные ТЕГИ
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    games.forEach(game => {
      game.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [games]);

  const allGenres = useMemo(() => {
    const genres = new Set(['All']);
    games.forEach(game => genres.add(game.genre));
    return Array.from(genres).sort();
  }, [games]);

  // ФИКСИРОВАННЫЙ СПИСОК РЕЖИМОВ + Комбинированный
  const allCoopModes = [
    'All', 
    'Single', 
    'Co-op', 
    'Multiplayer', 
    'Split Screen',
    'Co-op & Multiplayer' // <-- Новый пункт для всех сетевых/локальных режимов
  ];

  const filteredGames = useMemo(() => {
    const { selectedTags, selectedGenre, selectedCoop, sortBy } = filterState;
    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // Поиск по тексту
        if (searchLower && !game.searchableText.includes(searchLower)) {
          return false;
        }

        // Фильтр по тегам
        if (selectedTags.length > 0) {
          const gameTags = new Set([...game.tags, ...game.subgenres]);
          if (!selectedTags.every(tag => gameTags.has(tag))) {
            return false;
          }
        }

        // Фильтр по жанру
        if (selectedGenre !== 'All' && game.genre !== selectedGenre) return false;

        // УМНЫЙ ФИЛЬТР ПО РЕЖИМАМ
        if (selectedCoop !== 'All') {
          const gameModes = game.coop.toLowerCase(); 
          const targetMode = selectedCoop.toLowerCase();
          
          if (targetMode === 'split screen') {
             // Ищем "split screen" или "splitscreen"
             if (!gameModes.includes('split screen') && !gameModes.includes('splitscreen')) return false;
          } 
          else if (targetMode === 'co-op & multiplayer') {
             // Логика "ИЛИ": подходит, если есть Кооп, ИЛИ Мультиплеер, ИЛИ Сплитскрин
             const hasCoop = gameModes.includes('co-op');
             const hasMulti = gameModes.includes('multiplayer');
             const hasSplit = gameModes.includes('split screen') || gameModes.includes('splitscreen');
             
             if (!hasCoop && !hasMulti && !hasSplit) return false;
          }
          else {
             // Обычный поиск (Single, Co-op, Multiplayer)
             // Ищем подстроку (например, "Single" найдет "Single / Co-op")
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

  const handleSearchChange = useCallback((value: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: value }));
  }, [setFilterState]);

  const handleTagToggle = useCallback((tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, [setFilterState]);

  const handleGenreChange = useCallback((genre: string) => {
    setFilterState(prev => ({ ...prev, selectedGenre: genre }));
  }, [setFilterState]);

  const handleCoopChange = useCallback((coop: string) => {
    setFilterState(prev => ({ ...prev, selectedCoop: coop }));
  }, [setFilterState]);

  const handleSortChange = useCallback((sortBy: 'name' | 'genre' | 'coop') => {
    setFilterState(prev => ({ ...prev, sortBy }));
  }, [setFilterState]);

  const handleResetFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      selectedTags: [],
      selectedGenre: 'All',
      selectedCoop: 'All',
      sortBy: 'name',
    });
  }, [setFilterState]);

  useEffect(() => {
    const controller = new AbortController();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="app-container">
      <ErrorBoundary>
        <Header 
          totalGames={games.length}
          visibleGames={filteredGames.length}
          onSearch={handleSearchChange} 
          searchTerm={filterState.searchQuery}
        />
        
        <main className="main-content">
          <aside className="filters-sidebar">
            <div className="filters-sticky">
              <div className="filter-group">
                <label>Genre:</label>
                <select 
                  value={filterState.selectedGenre} 
                  onChange={(e) => handleGenreChange(e.target.value)}
                  className="filter-select"
                >
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Game Mode:</label>
                <select 
                  value={filterState.selectedCoop} 
                  onChange={(e) => handleCoopChange(e.target.value)}
                  className="filter-select"
                >
                  {allCoopModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sort by:</label>
                <select 
                  value={filterState.sortBy} 
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="name">By name</option>
                  <option value="genre">By genre</option>
                  <option value="coop">By game mode</option>
                </select>
              </div>

              <TagFilter 
                allTags={allTags}
                allSubgenres={allSubgenres}
                selectedTags={filterState.selectedTags}
                onTagToggle={handleTagToggle}
              />

              <button className="reset-btn" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          </aside>

          <section className="games-grid-section">
            <div className="results-count">
              Showing: {filteredGames.length} / {games.length}
            </div>
            
            <Suspense fallback={<LoadingSkeleton />}>
              {filteredGames.length > 0 ? (
                <GameGrid games={filteredGames} />
              ) : (
                <div className="no-results">
                  <h3>No games found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </Suspense>
          </section>
        </main>
      </ErrorBoundary>
    </div>
  );
}

export default App;
