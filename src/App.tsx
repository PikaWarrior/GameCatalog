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

interface ExtendedFilterState extends Omit<FilterState, 'selectedGenre'> {
  excludedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
}

function App() {
  const games: Game[] = useMemo(() => {
    // Теперь это преобразование безопасно, так как мы обновили типы
    return (rawGamesData as RawGame[]).map(game => sanitizeGameData(game));
  }, []);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters_v8', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
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

      return {
        ...game,
        id: `game-${index}-${game.name.toLowerCase().replace(/\s+/g, '-')}`,
        searchableText: `${game.name} ${game.description} ${game.tags.join(' ')} ${game.subgenres.join(' ')}`.toLowerCase(),
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
  }, [processedGames, filterState, debouncedSearch]);

  const handleOpenModal = useCallback((game: ProcessedGame) => setSelectedGame(game), []);
  const handleCloseModal = useCallback(() => setSelectedGame(null), []);
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
  
  const handleResetFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      selectedTags: [],
      excludedTags: [],
      selectedGenres: [],
      excludedGenres: [],
      selectedCoop: 'All',
      sortBy: 'name',
    });
  }, [setFilterState]);

  useEffect(() => {
    const controller = new AbortController();
    return () => { controller.abort(); };
  }, []);

  return (
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
              allGenres={allGenres}
              selectedGenres={filterState.selectedGenres || []}
              excludedGenres={filterState.excludedGenres || []}
              onGenreToggle={handleGenreToggle}

              allTags={allTags}
              allSubgenres={allSubgenres}
              selectedTags={filterState.selectedTags}
              excludedTags={filterState.excludedTags || []}
              onTagToggle={handleTagToggle}
            />

            <button className="reset-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </aside>

        <section className="games-grid-section">
          <Suspense fallback={<LoadingSkeleton />}>
            {filteredGames.length > 0 ? (
              <GameGrid games={filteredGames} onOpenModal={handleOpenModal} />
            ) : (
              <div className="no-results">
                <h3>No games found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </Suspense>
        </section>
      </main>

      {selectedGame && <GameModal game={selectedGame} onClose={handleCloseModal} />}
    </div>
  );
}

export default App;
