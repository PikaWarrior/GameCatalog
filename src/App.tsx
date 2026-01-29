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

interface ExtendedFilterState extends Omit<FilterState, 'selectedTags'> {
  selectedTags: string[];
  excludedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  showFavorites: boolean;
  filterMode: 'AND' | 'OR'; // НОВОЕ ПОЛЕ
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

  // ОБНОВИЛ ВЕРСИЮ ДО v16, ЧТОБЫ ПОДТЯНУЛОСЬ НОВОЕ ПОЛЕ filterMode
  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters_v16_FAV', {
    searchQuery: '',
    selectedTags: [],
    excludedTags: [],
    selectedGenres: [],
    excludedGenres: [],
    selectedCoop: 'All',
    sortBy: 'name',
    showFavorites: false,
    filterMode: 'AND', // По умолчанию строгий поиск
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

  // --- НОВОЕ: DEEP LINKING (Открытие по ссылке) ---
  useEffect(() => {
    if (processedGames.length === 0) return;
    
    // Читаем хэш: #game=The%20Witcher%203
    const hash = window.location.hash;
    if (hash.startsWith('#game=')) {
      const gameName = decodeURIComponent(hash.replace('#game=', ''));
      // Ищем точное совпадение по имени
      const foundGame = processedGames.find(g => g.name === gameName);
      if (foundGame) {
        setSelectedGame(foundGame);
      }
    }
  }, [processedGames]);

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
      filterMode // Берем режим из стейта
    } = filterState;

    const searchLower = debouncedSearch.toLowerCase();

    return processedGames
      .filter(game => {
        // Фильтр избранного
        if (showFavorites && !favorites.includes(game.id)) return false;

        // Поиск по тексту
        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        // 1. Логика ИСКЛЮЧЕНИЯ (всегда строгая: если есть запрещенный тег — скрываем)
        if (excludedTags.some(tag => gameTags.has(tag))) return false;
        if (excludedGenres.includes(game.normalizedGenre)) return false;

        // 2. Логика ВКЛЮЧЕНИЯ (Tags + Subgenres) с учетом режима
        if (selectedTags.length > 0) {
          if (filterMode === 'AND') {
             // Строго: игра должна содержать ВСЕ выбранные теги
             const hasAll = selectedTags.every(tag => gameTags.has(tag));
             if (!hasAll) return false;
          } else {
             // Гибко: игра должна содержать ХОТЯ БЫ ОДИН выбранный тег
             const hasAny = selectedTags.some(tag => gameTags.has(tag));
             if (!hasAny) return false;
          }
        }

        // 3. Жанры (Обычно у игры один жанр, так что здесь логика OR естественна: 
        // "покажи Action или RPG". Если выбрано несколько жанров, мы показываем игры, входящие в это множество)
        if (selectedGenres.length > 0 && !selectedGenres.includes(game.normalizedGenre)) {
           return false;
        }

        // Фильтр Coop
        if (selectedCoop !== 'All') {
           if (selectedCoop === 'Co-op & Multiplayer') {
             if (game.normalizedCoop === 'Single' || game.normalizedCoop === 'Split Screen') return false;
           } else if (selectedCoop === 'Co-op & Multiplayer & Split Screen') {
             if (game.normalizedCoop === 'Single') return false;
           } else {
             if (game.normalizedCoop !== selectedCoop) return false;
           }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
        return 0;
      });
  }, [processedGames, filterState, debouncedSearch, favorites]);

  // Обработчики фильтров
  const handleTagToggle = (tag: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedTags.includes(tag);
      const isExcluded = prev.excludedTags.includes(tag);

      let newSelected = [...prev.selectedTags];
      let newExcluded = [...prev.excludedTags];

      if (isSelected) {
        newSelected = newSelected.filter(t => t !== tag);
        newExcluded.push(tag);
      } else if (isExcluded) {
        newExcluded = newExcluded.filter(t => t !== tag);
      } else {
        newSelected.push(tag);
      }

      return { ...prev, selectedTags: newSelected, excludedTags: newExcluded };
    });
  };

  const handleGenreToggle = (genre: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedGenres.includes(genre);
      const isExcluded = prev.excludedGenres.includes(genre);

      let newSelected = [...prev.selectedGenres];
      let newExcluded = [...prev.excludedGenres];

      if (isSelected) {
        newSelected = newSelected.filter(g => g !== genre);
        newExcluded.push(genre);
      } else if (isExcluded) {
        newExcluded = newExcluded.filter(g => g !== genre);
      } else {
        newSelected.push(genre);
      }

      return { ...prev, selectedGenres: newSelected, excludedGenres: newExcluded };
    });
  };

  const handleClearFilters = () => {
    setFilterState(prev => ({
      ...prev,
      searchQuery: '',
      selectedTags: [],
      excludedTags: [],
      selectedGenres: [],
      excludedGenres: [],
      selectedCoop: 'All'
    }));
  };

  // НОВОЕ: Обработка клика по игре (меняет URL)
  const handleGameClick = (game: ProcessedGame) => {
    setSelectedGame(game);
    // Добавляем хэш в историю
    window.location.hash = `game=${encodeURIComponent(game.name)}`;
  };

  // НОВОЕ: Закрытие модалки (очистка URL)
  const handleCloseModal = () => {
    setSelectedGame(null);
    // Убираем хэш, не перезагружая страницу
    history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  return (
    <div className="app">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        searchValue={filterState.searchQuery}
        onSearchChange={(val) => setFilterState(prev => ({ ...prev, searchQuery: val }))}
      />
      
      <main className="main-content">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
             {/* Блок управления сортировкой и избранным */}
             <div className="filter-group">
                <h3>Sort & View</h3>
                <div className="controls-row">
                  <select 
                    value={filterState.sortBy}
                    onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="sort-select"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="rating">Rating</option>
                    <option value="year">Year</option>
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
              
              // НОВЫЕ ПРОПСЫ
              filterMode={filterState.filterMode}
              onToggleMode={() => setFilterState(prev => ({ ...prev, filterMode: prev.filterMode === 'AND' ? 'OR' : 'AND' }))}
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
            <Suspense fallback={<LoadingSkeleton />}>
               <GameGrid 
                 games={filteredGames} 
                 onGameClick={handleGameClick}
                 favorites={favorites}
                 onToggleFavorite={handleToggleFavorite}
               />
            </Suspense>
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
