import React, { useMemo, useCallback, useEffect, useState } from 'react';
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

// Прямой импорт GameGrid, чтобы избежать проблем с lazy loading
import GameGrid from "@components/GameGrid"; 
// Если этот импорт не сработает (зависит от index.ts), попробуй:
// import GameGrid from '@components/GameGrid/GameGrid';

// @ts-ignore
import rawGamesData from './data/FinalGameLib_WithSimilar.json';

// Расширенный интерфейс фильтров
interface ExtendedFilterState extends Omit<FilterState, 'selectedTags'> {
  selectedTags: string[];
  excludedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  showFavorites: boolean;
  filterMode: 'AND' | 'OR'; // НОВОЕ: режим фильтрации
}

function App() {
  // Загрузка данных
  const games: Game[] = useMemo(() => {
    const data = Array.isArray(rawGamesData) ? rawGamesData : (rawGamesData as any).games || [];
    return (data as RawGame[]).map(game => sanitizeGameData(game));
  }, []);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  // Локальное хранилище
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteGames_v1', []);
  
  // v20 - обновляем версию, чтобы инициализировать filterMode
  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters_v20_FINAL', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
    showFavorites: false,
    filterMode: 'AND', // По умолчанию строгий поиск (AND)
  });

  const debouncedSearch = useDebounce(filterState.searchQuery, 300);

  // Обработка игр (добавление ID и нормализация полей)
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

  // НОВОЕ: Deep Linking (открытие игры по ссылке #game=Name)
  useEffect(() => {
    if (processedGames.length === 0) return;
    const hash = window.location.hash;
    if (hash.startsWith('#game=')) {
      const gameName = decodeURIComponent(hash.replace('#game=', ''));
      const foundGame = processedGames.find(g => g.name === gameName);
      if (foundGame) {
        setSelectedGame(foundGame);
      }
    }
  }, [processedGames]);

  const handleToggleFavorite = useCallback((gameId: string) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) return prev.filter(id => id !== gameId);
      return [...prev, gameId];
    });
  }, [setFavorites]);

  // Сбор списков тегов/жанров
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
    'All', 'Single', 'Multiplayer', 'Split Screen', 'Co-op & Multiplayer', 'Co-op & Multiplayer & Split Screen'
  ];

  // Основная логика фильтрации
  const filteredGames = useMemo(() => {
    const {
      selectedTags, excludedTags,
      selectedGenres, excludedGenres,
      selectedCoop, sortBy, showFavorites,
      filterMode // Берем режим из стейта
    } = filterState;

    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // 1. Избранное
        if (showFavorites && !favorites.includes(game.id)) return false;
        // 2. Поиск по тексту
        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        // 3. Исключения (всегда строго: если есть запрещенный тег - скрываем)
        if (excludedTags.some(tag => gameTags.has(tag))) return false;
        if (excludedGenres.includes(game.normalizedGenre)) return false;

        // 4. Включения (Tags & Subgenres) - ЗДЕСЬ ИЗМЕНЕНИЯ (AND/OR)
        if (selectedTags.length > 0) {
          if (filterMode === 'AND') {
             // Строго (должны быть ВСЕ выбранные теги)
             if (!selectedTags.every(tag => gameTags.has(tag))) return false;
          } else {
             // Гибко (хотя бы ОДИН из выбранных)
             if (!selectedTags.some(tag => gameTags.has(tag))) return false;
          }
        }

        // 5. Жанры
        if (selectedGenres.length > 0 && !selectedGenres.includes(game.normalizedGenre)) return false;

        // 6. Coop
        if (selectedCoop !== 'All') {
           const gameModes = game.coop.toLowerCase();
           const targetMode = selectedCoop.toLowerCase();
           // Упрощенная логика проверки коопа (сохраняем твою логику)
           if (targetMode === 'co-op & multiplayer') {
             if (!gameModes.includes('co-op') && !gameModes.includes('multiplayer')) return false;
           } else if (targetMode === 'co-op & multiplayer & split screen') {
             if (!gameModes.includes('co-op') && !gameModes.includes('multiplayer') && !gameModes.includes('split')) return false;
           } else if (targetMode === 'split screen') {
             if (!gameModes.includes('split')) return false;
           } else {
             // Стандартная проверка
             if (game.normalizedCoop !== selectedCoop && !gameModes.includes(targetMode)) return false;
           }
        }

        return true;
      })
      .sort((a, b) => {
        const key = sortBy as string;
        if (key === 'name') return a.name.localeCompare(b.name);
        if (key === 'genre') return a.genre.localeCompare(b.genre);
        return 0;
      });
  }, [processedGames, filterState, debouncedSearch, favorites]);

  // Хелпер для переключения фильтров
  const toggleFilterItem = (
    item: string,
    keySelected: 'selectedTags' | 'selectedGenres',
    keyExcluded: 'excludedTags' | 'excludedGenres'
  ) => {
    setFilterState(prev => {
      const prevSelected = prev[keySelected] as string[];
      const prevExcluded = prev[keyExcluded] as string[];
      
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

      return { ...prev, [keySelected]: newSelected, [keyExcluded]: newExcluded };
    });
  };

  const handleTagToggle = (tag: string) => toggleFilterItem(tag, 'selectedTags', 'excludedTags');
  const handleGenreToggle = (genre: string) => toggleFilterItem(genre, 'selectedGenres', 'excludedGenres');
  
  const handleClearFilters = () => {
    setFilterState(prev => ({
      ...prev, searchQuery: '', selectedTags: [], excludedTags: [], selectedGenres: [], excludedGenres: [], selectedCoop: 'All'
    }));
  };

  // НОВОЕ: Обработчики открытия/закрытия игры с обновлением URL
  const handleGameClick = (game: ProcessedGame) => {
    setSelectedGame(game);
    window.location.hash = `game=${encodeURIComponent(game.name)}`;
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
    history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  return (
    <div className="app">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        // Передаем правильные пропсы для поиска и статистики
        searchTerm={filterState.searchQuery}
        onSearch={(val) => setFilterState(prev => ({ ...prev, searchQuery: val }))}
        totalGames={games.length}
        visibleGames={filteredGames.length}
      />
      
      <main className="main-content">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
             <div className="filter-group">
                <h3>Sort & View</h3>
                <div className="controls-row">
                  <select 
                    value={filterState.sortBy}
                    onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="sort-select"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="genre">Genre</option>
                  </select>
                  
                  <button 
                    className={`fav-filter-btn ${filterState.showFavorites ? 'active' : ''}`}
                    onClick={() => setFilterState(prev => ({ ...prev, showFavorites: !prev.showFavorites }))}
                    title="Show Favorites Only"
                  >
                    <Heart size={18} fill={filterState.showFavorites ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="coop-filter">
                  <label>Co-op Mode:</label>
                  <select 
                    value={filterState.selectedCoop}
                    onChange={(e) => setFilterState(prev => ({ ...prev, selectedCoop: e.target.value }))}
                  >
                    {allCoopModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
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
              
              // НОВЫЕ ПРОПСЫ: Режим фильтрации
              filterMode={filterState.filterMode}
              onToggleMode={() => setFilterState(prev => ({ 
                  ...prev, 
                  filterMode: prev.filterMode === 'AND' ? 'OR' : 'AND' 
              }))}
            />
            
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear All Filters
            </button>
            
            <div className="sidebar-footer">
               games: {filteredGames.length} / {games.length}
            </div>
          </div>
        </aside>

        <section className="content">
          <ErrorBoundary>
             {/* Рендерим GameGrid напрямую, без Suspense (раз импорт статический) */}
             <GameGrid 
               games={filteredGames} 
               onOpenModal={handleGameClick} // Убедись, что пропс называется onOpenModal (в твоем GameGrid.tsx так)
               favorites={favorites}
               onToggleFavorite={handleToggleFavorite}
             />
          </ErrorBoundary>
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
  );
}

export default App;
