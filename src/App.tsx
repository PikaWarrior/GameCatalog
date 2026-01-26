import React, { useMemo, useCallback, lazy, Suspense, useEffect, useState } from 'react';
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

// Импортируем новый файл данных
// @ts-ignore
import rawGamesData from './data/FinalGameLib_WithSimilar.json';

const GameGrid = lazy(() => import('./components/GameGrid'));

// Расширенный тип для фильтров внутри компонента, если нужно
interface ExtendedFilterState extends FilterState {}

function App() {
  // Первичная обработка и санитизация
  const games: Game[] = useMemo(() => {
    return (rawGamesData as any[]).map(game => sanitizeGameData(game));
  }, []);

  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  // Состояние фильтров с сохранением в LocalStorage
  // Обновил версию ключа на v8, чтобы сбросить старые настройки пользователей из-за новой структуры
  const [filterState, setFilterState] = useLocalStorage<FilterState>('gameFilters_v8', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  // Подготовка данных для рендера (добавление ID, нормализация, текстовый индекс)
  const processedGames = useMemo(() => {
    return games.map((game, index): ProcessedGame => {
      const coopLower = game.coop.toLowerCase();
      let displayCoop = game.coop.split(' / ')[0];

      // Нормализация Coop режимов
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

      // Формируем строку для поиска. Добавляем similar_games!
      const similarText = game.similar_games.map(s => s.name).join(' ');

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

  // Списки для фильтров (вычисляются один раз)
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

  // Логика фильтрации
  const filteredGames = useMemo(() => {
    const {
      selectedTags, excludedTags,
      selectedGenres, excludedGenres,
      selectedCoop, sortBy
    } = filterState;

    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // 1. Поиск
        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        // 2. Теги (Include)
        if (selectedTags.length > 0) {
          if (!selectedTags.every(tag => gameTags.has(tag))) return false;
        }

        // 3. Теги (Exclude)
        if (excludedTags && excludedTags.length > 0) {
          if (excludedTags.some(tag => gameTags.has(tag))) return false;
        }

        // 4. Жанры (Exclude - приоритетнее)
        if (excludedGenres && excludedGenres.length > 0) {
          if (excludedGenres.includes(game.genre)) return false;
        }

        // 5. Жанры (Include)
        if (selectedGenres && selectedGenres.length > 0) {
          if (!selectedGenres.includes(game.genre)) return false;
        }

        // 6. Coop режим
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
            // OR logic
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

  // Хендлеры фильтров
  const toggleFilterItem = (
    item: string,
    keySelected: keyof FilterState,
    keyExcluded: keyof FilterState
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
    toggleFilterItem(tag, 'selectedTags', 'excludedTags');
  }, [setFilterState]);

  const handleGenreToggle = useCallback((genre: string) => {
    toggleFilterItem(genre, 'selectedGenres', 'excludedGenres');
  }, [setFilterState]);

  const handleCoopChange = useCallback((coop: string) => setFilterState(p => ({ ...p, selectedCoop: coop })), [setFilterState]);
  const handleSortChange = useCallback((sortBy: any) => setFilterState(p => ({ ...p, sortBy })), [setFilterState]);
  const handleSearchChange = useCallback((value: string) => setFilterState(p => ({ ...p, searchQuery: value })), [setFilterState]);
  
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

  return (
    <div className="app-container">
      <ErrorBoundary>
        <Header 
          totalGames={filteredGames.length}
          onReset={handleResetFilters}
          hasActiveFilters={
            filterState.selectedTags.length > 0 || 
            filterState.excludedTags.length > 0 || 
            filterState.selectedGenres.length > 0 ||
            filterState.excludedGenres.length > 0 ||
            filterState.selectedCoop !== 'All' ||
            filterState.searchQuery !== ''
          }
        />
        
        <main className="main-content">
          <aside className="sidebar">
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
            />
          </aside>

          <section className="content-area">
             {/* Поиск и контролы сортировки можно добавить сюда или в Header */}
             <div className="top-controls">
                {/* Компонент поиска */}
             </div>

            <Suspense fallback={<LoadingSkeleton count={12} />}>
              <GameGrid 
                games={filteredGames} 
                onOpenModal={handleOpenModal} 
              />
            </Suspense>
          </section>
        </main>

        <GameModal game={selectedGame} onClose={handleCloseModal} />
      </ErrorBoundary>
    </div>
  );
}

export default App;
