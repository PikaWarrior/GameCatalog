import React, { memo } from 'react';
import { 
  Gamepad2, Users, Globe, Monitor, User, 
  Sword, Scroll, Brain, Hammer, Ghost, 
  Trophy, Car, Rocket, Puzzle, Coffee,
  Skull, Crosshair, Map, Dna, Music
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onOpenModal?: (game: ProcessedGame) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style, onOpenModal }) => {
  
  // НАСТРОЙКИ ИКОНОК
  const ICON_SIZE = 15;      // Чуть крупнее
  const ICON_STROKE = 2.5;   // Жирные линии для "сочности"

  // --- 1. ЛОГИКА КООП-РЕЖИМОВ (Уникальные цвета и иконки) ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    
    // Singleplayer -> Серый + Человек
    if (lower.includes('single')) {
      return { 
        color: '#64748b', 
        borderColor: 'rgba(255,255,255,0.2)',
        icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Single' 
      };
    }
    // Split Screen / Local -> Оранжевый + Монитор
    if (lower.includes('split') || lower.includes('shared') || lower.includes('local')) {
      return { 
        color: '#ea580c', // Orange-600
        borderColor: '#fb923c',
        icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Split Screen' 
      };
    }
    // Online Multiplayer -> Фиолетовый + Глобус
    if (lower.includes('online') || lower.includes('mmo') || lower.includes('multi')) {
      return { 
        color: '#7c3aed', // Violet-600
        borderColor: '#a78bfa',
        icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Multiplayer' 
      };
    }
    // Co-op (General) -> Изумрудный + Группа
    return { 
      color: '#059669', // Emerald-600
      borderColor: '#34d399',
      icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
      label: 'Co-op' 
    };
  };

  // --- 2. ЛОГИКА ЖАНРОВ (ДЕТАЛЬНАЯ ПРОВЕРКА) ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();

    // Action / Fighting / Hack & Slash -> Красный + Меч
    if (g.includes('action') || g.includes('hack') || g.includes('fighting') || g.includes('beat')) {
      return { color: '#dc2626', icon: <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    
    // Shooter / FPS / TPS -> Темно-Красный + Прицел
    if (g.includes('shooter') || g.includes('fps') || g.includes('tps') || g.includes('gun')) {
      return { color: '#b91c1c', icon: <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // RPG / Adventure -> Зеленый + Карта/Свиток
    if (g.includes('adventure') || g.includes('quest')) {
      return { color: '#059669', icon: <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    if (g.includes('rpg') || g.includes('role')) {
      return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Roguelike / Dungeon -> Оранжевый + Череп
    if (g.includes('rogue') || g.includes('dungeon') || g.includes('souls')) {
      return { color: '#d97706', icon: <Skull size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Metroidvania / Platformer -> Розовый + ДНК (или Пазл)
    if (g.includes('metroidvania') || g.includes('platformer')) {
      return { color: '#db2777', icon: <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Strategy / Card -> Синий + Мозг
    if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('turn') || g.includes('tactical')) {
      return { color: '#2563eb', icon: <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Simulation / Build -> Желтый/Янтарный + Молоток
    if (g.includes('sim') || g.includes('build') || g.includes('craft') || g.includes('sandbox') || g.includes('farm') || g.includes('city')) {
      return { color: '#d97706', icon: <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} /> }; 
    }

    // Horror -> Бордовый + Призрак
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) {
      return { color: '#9f1239', icon: <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Sports -> Фиолетовый + Кубок
    if (g.includes('sport')) {
      return { color: '#7c3aed', icon: <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Racing -> Оранжевый яркий + Машина
    if (g.includes('racing') || g.includes('drive') || g.includes('automotive')) {
      return { color: '#ea580c', icon: <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Sci-Fi / Cyberpunk -> Индиго + Ракета
    if (g.includes('space') || g.includes('sci-fi') || g.includes('cyberpunk')) {
      return { color: '#4f46e5', icon: <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Puzzle -> Фуксия + Пазл
    if (g.includes('puzzle') || g.includes('logic')) {
      return { color: '#c026d3', icon: <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    
    // Rhythm / Music -> Лайм + Музыка
    if (g.includes('music') || g.includes('rhythm')) {
      return { color: '#65a30d', icon: <Music size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Casual / Indie / Visual Novel -> Голубой + Кофе
    if (g.includes('casual') || g.includes('indie') || g.includes('novel')) {
      return { color: '#0891b2', icon: <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    // Default -> Slate + Gamepad
    return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  };

  const genreInfo = getGenreDetails(game.genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);
  const cleanDesc = (game.description || "No description").replace(/<[^>]*>?/gm, '');

  return (
    <div 
      style={style} 
      className="game-card-wrapper"
      onClick={() => onOpenModal?.(game)}
    >
      <div className="game-card-inner">
        
        {/* КАРТИНКА */}
        <div className="game-card-image">
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-game.jpg'; }}
          />
          
          <div className="card-badges">
            {/* ЖАНР */}
            <span 
              className="badge" 
              style={{ backgroundColor: genreInfo.color, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <span className="badge-icon">{genreInfo.icon}</span>
              <span>{game.genre}</span>
            </span>
            
            {/* РЕЖИМ */}
            <span 
              className="badge" 
              style={{ backgroundColor: coopInfo.color, borderColor: coopInfo.borderColor }}
            >
              <span className="badge-icon">{coopInfo.icon}</span>
              <span>{coopInfo.label}</span>
            </span>
          </div>
        </div>

        {/* КОНТЕНТ */}
        <div className="card-content">
          <div className="card-header-row">
            <h3 className="card-title" title={game.name}>
              {game.name}
            </h3>
            <a 
              href={game.steam_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="steam-icon-link"
              onClick={(e) => e.stopPropagation()}
              title="Open in Steam"
            >
              <Gamepad2 size={18} />
            </a>
          </div>

          <div className="card-description-static">
            {cleanDesc}
          </div>

          {/* ПОХОЖИЕ ИГРЫ (МАСШТАБИРУЕМЫЕ) */}
          <div className="card-similar-section">
            <div className="similar-label">Similar Games:</div>
            
            {game.similar_games && game.similar_games.length > 0 ? (
              <div className="card-similar-grid">
                {game.similar_games.slice(0, 3).map((sim, i) => (
                  <a 
                    key={sim.id || i}
                    href={sim.url}
                    target="_blank"
                    rel="noreferrer"
                    className="card-similar-item"
                    title={sim.name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={sim.image} alt={sim.name} loading="lazy" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="no-similar">No similar games found</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default GameCard;
