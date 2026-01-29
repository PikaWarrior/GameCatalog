import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from '@components/ErrorBoundary';
import Header from '@components/Header';
import TagFilter from '@components/TagFilter';
import GameModal from '@components/GameModal';
// ИСПРАВЛЕНИЕ: Статический импорт вместо lazy. 
// Если этот путь не сработает, попробуй './components/GameGrid'
import GameGrid from '@components/GameGrid'; 

import { useDebounce } from '@hooks/useDebounce';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { sanitizeGameData } from '@utils/sanitize';
import { Game, ProcessedGame, FilterState, RawGame } from './types';
import { Heart } from 'lucide-react';
import '@styles/App.css';
import '@styles/improvements.css';

// @ts-ignore
import rawGamesData from './data/FinalGameLib_WithSimilar.json';

// Расширяем интерфейс состояния
interface ExtendedFilterState extends Omit<FilterState, 'selectedTags'> {
  selectedTags: string[];
  excludedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  showFavorites: boolean;
  filterMode: 'AND' | 'OR'; // Новый режим
}

function App() {
  // 1. Загрузка и санитайзинг данных
  const games: Game[] = useMemo(() => {
    const data = Array.isArray(rawGamesData) ? rawGamesData : (rawGamesData as any).games || [];
    return (data as RawGame[]).map(game => sanitizeGameData(game));
  }, []);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ProcessedGame | null>(null);

  // 2. Локальное хранилище
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteGames_v1', []);
  // v19 - новая версия хранилища для сброса старых ошибок
  const [filterState, setFilterState] = useLocalStorage<ExtendedFilterState>('gameFilters_v19_STABLE', {
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

  // 3. Подготовка данных (процессинг)
  const processedGames = useMemo(() => {
    return games.map((game, index): ProcessedGame => {
      const coopLower = game.coop.toLowerCase();
      let displayCoop = game.coop.split(' / ')[0];

      if (displayCoop === 'Single' && (
        coopLower.includes('multiplayer') || coopLower.includes('co-op') || 
        coopLower.includes('online') || coopLower.includes('shared') || coopLower.includes('split')
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

  // 4. Deep Linking (открытие по ссылке)
  useEffect(() => {
    if (processedGames.length === 0) return;
    const hash = window.location.hash;
    if (hash.startsWith('#game=')) {
      const gameName = decodeURIComponent(hash.replace('#game=', ''));
      const foundGame = processedGames.find(g => g.name === gameName);
      if (foundGame) setSelectedGame(foundGame);
    }
  }, [processedGames]);

  // 5. Обработчики
  const handleToggleFavorite = useCallback((gameId: string) => {
    setFavorites(prev => prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]);
  }, [setFavorites]);

  const handleGameClick = (game: ProcessedGame) => {
    setSelectedGame(game);
    window.location.hash = `game=${encodeURIComponent(game.name)}`;
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
    history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  const handleClearFilters = () => {
    setFilterState(prev => ({
      ...prev, searchQuery: '', selectedTags: [], excludedTags: [], selectedGenres: [], excludedGenres: [], selectedCoop: 'All'
    }));
  };

  // 6. Списки для фильтров
  const allSubgenres = useMemo(() => {
    const set = new Set<string>(); games.forEach(g => g.subgenres.forEach(s => set.add(s))); return Array.from(set).sort();
  }, [games]);
  const allTags = useMemo(() => {
    const set = new Set<string>(); games.forEach(g => g.tags.forEach(t => set.add(t))); return Array.from(set).sort();
  }, [games]);
  const allGenres = useMemo(() => {
    const set = new Set<string>(); games.forEach(g => set.add(g.genre)); return Array.from(set).sort();
  }, [games]);
  const allCoopModes = ['All', 'Single', 'Multiplayer', 'Split Screen', 'Co-op & Multiplayer', 'Co-op & Multiplayer & Split Screen'];

  // 7. ЛОГИКА ФИЛЬТРАЦИИ
  const filteredGames = useMemo(() => {
    const { selectedTags, excludedTags, selectedGenres, excludedGenres, selectedCoop, sortBy, showFavorites, filterMode } = filterState;
    const searchLower = debouncedSearch.toLowerCase();

    return processedGames.filter(game => {
        // Избранное
        if (showFavorites && !favorites.includes(game.id)) return false;
        // Поиск текста
        if (searchLower && !game.searchableText.includes(searchLower)) return false;

        const gameTags = new Set([...game.tags, ...game.subgenres]);

        // Исключения (всегда строго)
        if (excludedTags.some(tag => gameTags.has(tag))) return false;
        if (excludedGenres.includes(game.normalizedGenre)) return false;

        // Включения (зависит от filterMode: AND / OR)
        if (selectedTags.length > 0) {
          if (filterMode === 'AND') {
             if (!selectedTags.every(tag => gameTags.has(tag))) return false;
          } else {
             if (!selectedTags.some(tag => gameTags.has(tag))) return false;
          }
        }

        // Жанры (всегда OR для списка, но игра имеет 1 жанр)
        if (selectedGenres.length > 0 && !selectedGenres.includes(game.normalizedGenre)) return false;

        // Кооп
        if (selectedCoop !== 'All') {
           const gameModes = game.coop.toLowerCase();
           const target = selectedCoop.toLowerCase();
           
           if (target === 'co-op & multiplayer') {
             if (!gameModes.includes('co-op') && !gameModes.includes('multiplayer')) return false;
           } else if (target === 'co-op & multiplayer & split screen') {
             if (!gameModes.includes('co-op') && !gameModes.includes('multiplayer') && !gameModes.includes('split')) return false;
           } else if (target === 'split screen') {
             if (!gameModes.includes('split')) return false;
           } else {
             if (game.normalizedCoop !== selectedCoop && !gameModes.includes(target)) return false; 
           }
        }
        return true;
    }).sort((a, b) => {
        const key = sortBy as string;
        if (key === 'name') return a.name.localeCompare(b.name);
        if (key === 'genre') return a.genre.localeCompare(b.genre);
        return 0;
    });
  }, [processedGames, filterState, debouncedSearch, favorites]);

  // Обработчики тогглов
  const toggleFilter = (item: string, listKey: 'selectedTags' | 'selectedGenres', excludeKey: 'excludedTags' | 'excludedGenres') => {
      setFilterState(prev => {
          const isSel = prev[listKey].includes(item);
          const isExcl = prev[excludeKey].includes(item);
          let newSel = [...prev[listKey]];
          let newExcl = [...prev[excludeKey]];

          if (isSel) { newSel = newSel.filter(x => x !== item); newExcl.push(item); }
          else if (isExcl) { newExcl = newExcl.filter(x => x !== item); }
          else { newSel.push(item); }
          
          return { ...prev, [listKey]: newSel, [excludeKey]: newExcl };
      });
  };

  return (
    <div className="app">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        // Исправленные пропсы для Header
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
                    {allCoopModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                </div>
             </div>

            <TagFilter 
              allGenres={allGenres}
              selectedGenres={filterState.selectedGenres}
              excludedGenres={filterState.excludedGenres}
              onGenreToggle={(g) => toggleFilter(g, 'selectedGenres', 'excludedGenres')}
              
              allTags={allTags}
              allSubgenres={allSubgenres}
              selectedTags={filterState.selectedTags}
              excludedTags={filterState.excludedTags}
              onTagToggle={(t) => toggleFilter(t, 'selectedTags', 'excludedTags')}
              
              // Пропсы для переключения режима
              filterMode={filterState.filterMode}
              onToggleMode={() => setFilterState(prev => ({ ...prev, filterMode: prev.filterMode === 'AND' ? 'OR' : 'AND' }))}
            />
            
            <button className="clear-filters-btn" onClick={handleClearFilters}>Clear All Filters</button>
            
            <div className="sidebar-footer">games: {filteredGames.length} / {games.length}</div>
          </div>
        </aside>

        <section className="content">
          <ErrorBoundary>
             {/* Исправлен вызов GameGrid (убран Suspense) */}
             <GameGrid 
               games={filteredGames} 
               onOpenModal={handleGameClick} // Правильное имя пропса
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
