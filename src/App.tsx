import React, { useMemo, useCallback, lazy, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from '@components/ErrorBoundary';
import Header from '@components/Header';
import TagFilter from '@components/TagFilter';
import LoadingSkeleton from '@components/LoadingSkeleton';
import GameModal from '@components/GameModal';
import SearchBar from '@components/SearchBar'; // Если он используется отдельно
import { useDebounce } from '@hooks/useDebounce';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { sanitizeGameData } from '@utils/sanitize';
import { Game, ProcessedGame, FilterState } from './types';
import '@styles/App.css';
import '@styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/games_data_ENRICHED_PRO.json';

// Ленивая загрузка сетки для ускорения старта
const GameGrid = lazy(() => import('@components/GameGrid'));

function App() {
  // 1. Загрузка и очистка данных (один раз при старте)
  const games: Game[] = useMemo(() => {
    return (rawGamesData as any[]).map(game => sanitizeGameData(game));
  }, []);

  // 2. Состояние интерфейса
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  // 3. Состояние фильтров (сохраняется в LocalStorage)
  const [filterState, setFilterState] = useLocalStorage<FilterState>('gameFilters', {
    searchQuery: '',
    selectedTags: [],
    selectedGenre: 'All',
    selectedCoop: 'All',
    sortBy: 'name',
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  // 4. Подготовка данных (добавление ID и нормализация)
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

  // 5. Списки для фильтров (вычисляются на лету)
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

  // 6. Логика фильтрации
  const filteredGames = useMemo(() => {
    const { selectedTags, selectedGenre, selectedCoop, sortBy } = filterState;
    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // Поиск
        if (searchLower && !game.searchableText.includes(searchLower)) return false;
        
        // Теги (AND логика)
        if (selectedTags.length > 0) {
          const gameTags = new Set([...game.tags, ...game.subgenres]);
          if (!selectedTags.every(tag => gameTags.has(tag))) return false;
        }

        // Жанр
        if (selectedGenre !== 'All' && game.genre !== selectedGenre) return false;

        // Кооп режим
        if (selectedCoop !== 'All') {
          const gameModes = game.coop.toLowerCase();
          const targetMode = selectedCoop.toLowerCase();
          
          if (targetMode === 'split screen') {
             if (!gameModes.includes('split screen') && !gameModes.includes('splitscreen')) return false;
          } else if (targetMode === 'co-op & multiplayer') {
             const hasCoop = gameModes.includes('co-op');
             const hasMulti = gameModes.includes('multiplayer');
             const hasSplit = gameModes.includes('split screen');
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
  }, [processedGames, filterState, debouncedSearch]);

  // 7. Обработчики событий
  const handleOpenModal = useCallback((game: ProcessedGame) => {
    setSelectedGame(game);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedGame(null);
  }, []);

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

  // Очистка при размонтировании
  useEffect(() => {
    const controller = new AbortController();
    return () => { controller.abort(); };
  }, []);

  return (
    <div className="app-container">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
      />
      
      {/* Если SearchBar вынесен в Header, этот блок можно убрать, но для структуры оставляю */}
      <div className="controls-area">
          {/* Место для дополнительных контролов сортировки, если нужно */}
      </div>

      <div className="main-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <TagFilter 
            allTags={allTags}
            allSubgenres={allSubgenres}
            selectedTags={filterState.selectedTags}
            onTagToggle={handleTagToggle}
          />
        </aside>

        <main className="content-area">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <GameGrid 
                games={filteredGames} 
                onOpenModal={handleOpenModal} 
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Модальное окно (рендерится поверх всего) */}
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
