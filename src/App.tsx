import React, { useMemo, useCallback, lazy, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from '@components/ErrorBoundary';
import Header from '@components/Header';
import TagFilter from '@components/TagFilter';
import LoadingSkeleton from '@components/LoadingSkeleton';
import GameModal from '@components/GameModal';
import { useDebounce } from '@hooks/useDebounce';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { sanitizeGameData } from '@utils/sanitize';
import { Game, ProcessedGame, FilterState } from './types';
import '@styles/App.css';
import '@styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/games_data_ENRICHED_PRO.json';

const GameGrid = lazy(() => import('@components/GameGrid'));

// Расширяем интерфейс состояния, чтобы добавить исключенные теги
interface ExtendedFilterState extends FilterState {
  excludedTags: string[];
}

function App() {
  // 1. Загрузка и первичная обработка данных
  const games: Game[] = useMemo(() => {
    return (rawGamesData as any[]).map(game => sanitizeGameData(game));
  }, []);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  // 2. Состояние фильтров с новым полем excludedTags
  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [], 
    selectedGenre: 'All',
    selectedCoop: 'All',
    sortBy: 'name',
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  // 3. Подготовка данных для поиска
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

  // 4. Генерация списков для фильтров
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
    const genres = new Set(['All']);
    games.forEach(game => genres.add(game.genre));
    return Array.from(genres).sort();
  }, [games]);

  // Список режимов БЕЗ "Co-op" (как вы просили)
  const allCoopModes = [
    'All', 'Single', 'Multiplayer', 'Split Screen', 'Co-op & Multiplayer'
  ];

  // 5. Логика фильтрации
  const filteredGames = useMemo(() => {
    const { selectedTags, excludedTags, selectedGenre, selectedCoop, sortBy } = filterState;
    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // --- Поиск по тексту ---
        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        // --- Включенные теги (Логика AND: игра должна содержать ВСЕ выбранные) ---
        if (selectedTags.length > 0) {
          if (!selectedTags.every(tag => gameTags.has(tag))) return false;
        }

        // --- Исключенные теги (Логика NOT: игра НЕ должна содержать ни одного) ---
        if (excludedTags && excludedTags.length > 0) {
           if (excludedTags.some(tag => gameTags.has(tag))) return false;
        }

        // --- Жанр ---
        if (selectedGenre !== 'All' && game.genre !== selectedGenre) return false;

        // --- Режим игры ---
        if (selectedCoop !== 'All') {
          const gameModes = game.coop.toLowerCase();
          const targetMode = selectedCoop.toLowerCase();

          // СПЕЦИАЛЬНАЯ ЛОГИКА ДЛЯ SINGLE:
          // Если выбран Single, скрываем игры, где есть хоть намек на мультиплеер
          if (targetMode === 'single') {
             const hasMultiplayerFeatures = 
                gameModes.includes('multiplayer') || 
                gameModes.includes('co-op') || 
                gameModes.includes('online') || 
                gameModes.includes('lan') ||
                gameModes.includes('split') ||
                gameModes.includes('shared');
             
             if (hasMultiplayerFeatures) return false;
          }
          // Остальные режимы
          else if (targetMode === 'split screen') {
             if (!gameModes.includes('split screen') && !gameModes.includes('splitscreen')) return false;
          }
          else if (targetMode === 'co-op & multiplayer') {
             const hasCoop = gameModes.includes('co-op');
             const hasMulti = gameModes.includes('multiplayer');
             const hasSplit = gameModes.includes('split screen') || gameModes.includes('splitscreen');
             if (!hasCoop && !hasMulti && !hasSplit) return false;
          }
          else {
             // Стандартная проверка на вхождение подстроки
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

  // 6. Обработчики событий (Handlers)

  const handleOpenModal = useCallback((game: ProcessedGame) => {
    setSelectedGame(game);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedGame(null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: value }));
  }, [setFilterState]);

  // Главная логика переключения тегов: Include -> Exclude -> Reset
  const handleTagToggle = useCallback((tag: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedTags.includes(tag);
      const isExcluded = prev.excludedTags?.includes(tag);

      let newSelected = [...prev.selectedTags];
      let newExcluded = [...(prev.excludedTags || [])];

      if (isSelected) {
        // Если тег был "Включен", переводим его в "Исключен"
        newSelected = newSelected.filter(t => t !== tag);
        newExcluded.push(tag);
      } else if (isExcluded) {
        // Если тег был "Исключен", сбрасываем его (удаляем отовсюду)
        newExcluded = newExcluded.filter(t => t !== tag);
      } else {
        // Если тег был нейтрален, делаем его "Включенным"
        newSelected.push(tag);
      }

      return {
        ...prev,
        selectedTags: newSelected,
        excludedTags: newExcluded
      };
    });
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
      excludedTags: [],
      selectedGenre: 'All',
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
              <GameGrid 
                 games={filteredGames} 
                 onOpenModal={handleOpenModal}
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
        />
      )}
    </div>
  );
}

export default App;
