import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import TagFilter from './components/TagFilter';
import GameModal from './components/GameModal';
import './App.css';

// --- Типы данных (лучше вынести в types.ts, но для примера оставим тут) ---
export interface Game {
  id: string;
  title: string;
  coverUrl: string;
  backdropUrl?: string; // Горизонтальная картинка для фона модалки
  description: string;
  rating: number;
  releaseYear: string;
  subgenres: string[];
  tags: string[];
}

// --- Тестовые данные (Mock Data) ---
const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Cyber Odyssey 2077',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    description: 'A futuristic open-world RPG where you play as a mercenary outlaw seeking a one-of-a-kind implant that is the key to immortality. Customise your character’s cyberware, skillset and playstyle, and explore a vast city where the choices you make shape the story and the world around you.',
    rating: 4.8,
    releaseYear: '2023',
    subgenres: ['RPG', 'Open World'],
    tags: ['Sci-Fi', 'Cyberpunk', 'Story Rich', 'Singleplayer']
  },
  {
    id: '2',
    title: 'Stellar Command',
    coverUrl: 'https://images.unsplash.com/photo-1614728853913-1e2211f9ca81?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    description: 'Build your own space station and manage the economy, trade routes, and defenses against alien threats. A deep strategy game for management lovers.',
    rating: 4.5,
    releaseYear: '2024',
    subgenres: ['Strategy', 'Simulation'],
    tags: ['Space', 'Management', 'Base Building', 'RTS']
  },
  {
    id: '3',
    title: 'Shadows of Eldoria',
    coverUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=600&q=80',
    description: 'Dark fantasy action-adventure game with souls-like combat mechanics. Explore the ruined kingdom of Eldoria and uncover its secrets.',
    rating: 4.9,
    releaseYear: '2022',
    subgenres: ['Action', 'Adventure'],
    tags: ['Dark Fantasy', 'Souls-like', 'Difficult', 'Atmospheric']
  },
  {
    id: '4',
    title: 'Pixel Kart Racing',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    description: 'Retro style kart racing game with local multiplayer support. Fun for the whole family!',
    rating: 4.2,
    releaseYear: '2021',
    subgenres: ['Racing', 'Arcade'],
    tags: ['Pixel Art', 'Multiplayer', 'Family', 'Casual']
  },
];

// Собираем все уникальные теги и жанры для фильтра
const ALL_TAGS = Array.from(new Set(MOCK_GAMES.flatMap(g => g.tags))).sort();
const ALL_SUBGENRES = Array.from(new Set(MOCK_GAMES.flatMap(g => g.subgenres))).sort();

const App: React.FC = () => {
  // --- Состояния ---
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // --- Логика фильтрации ---
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Мемоизация фильтрации (чтобы не пересчитывать при каждом чихе)
  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      // 1. Поиск по названию
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Фильтрация по тегам (Если теги выбраны, игра должна содержать ХОТЯ БЫ ОДИН из них - логика OR)
      // Если нужна логика AND (строгое совпадение всех), замените .some на .every
      const allGameTags = [...game.subgenres, ...game.tags];
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => allGameTags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags]);

  return (
    <div className="app-container">
      {/* --- Шапка --- */}
      <header className="app-header">
        <h1 className="logo">GameVault</h1>
        <div className="search-bar">
          <Search size={18} className="search-icon-main" />
          <input 
            type="text" 
            placeholder="Search games..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="main-content">
        {/* --- Сайдбар (Фильтры) --- */}
        <aside className="sidebar">
          <TagFilter 
            allTags={ALL_TAGS}
            allSubgenres={ALL_SUBGENRES}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        </aside>

        {/* --- Сетка игр --- */}
        <main className="games-grid-container">
          {filteredGames.length > 0 ? (
            <div className="games-grid">
              {filteredGames.map(game => (
                // ВНИМАНИЕ: Здесь должен быть твой компонент GameCard
                // Я использую упрощенную верстку для примера, 
                // замени <div className="game-card"> на <GameCard ... />
                <div 
                  key={game.id} 
                  className="game-card-placeholder"
                  onClick={() => setSelectedGame(game)}
                >
                  <img src={game.coverUrl} alt={game.title} />
                  <div className="card-info">
                    <h3>{game.title}</h3>
                    <div className="card-tags">
                      {game.subgenres[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No games found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- Модальное окно --- */}
      <GameModal 
        game={selectedGame} 
        onClose={() => setSelectedGame(null)} 
      />
    </div>
  );
};

export default App;
