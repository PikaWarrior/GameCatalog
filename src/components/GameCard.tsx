import React, { memo } from 'react';
import { ProcessedGame } from '../types';
import { 
  User, Users, Monitor, Globe, Sword, Crosshair, Map, Scroll, 
  Skull, Dna, Brain, Hammer, Ghost, Trophy, Car, Rocket, 
  Puzzle, Music, Coffee, Gamepad2, Heart, ExternalLink,
  Flame, Book // 🆕 Добавил иконки для Survival и Visual Novel
} from 'lucide-react';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  onOpenModal: (game: ProcessedGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  style?: React.CSSProperties;
}

const ICON_SIZE = 12;
const ICON_STROKE = 2.5;

const getCoopDetails = (coop: string) => {
  const lower = coop.toLowerCase();
  if (lower.includes('single')) return { color: '#64748b', icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Single' };
  if (lower.includes('split') || lower.includes('shared')) return { color: '#ea580c', icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Split Screen' };
  if (lower.includes('online') || lower.includes('multi')) return { color: '#7c3aed', icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Multiplayer' };
  return { color: '#059669', icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Co-op' };
};

const getGenreDetails = (genre: string) => {
  const g = genre.toLowerCase();
  
  // 🆕 Survival (Выживание) - Оранжевый + Огонь
  if (g.includes('survival')) return { color: '#f97316', icon: <Flame size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  
  // 🆕 Visual Novel (Визуальные новеллы) - Розовый/Фиолетовый + Книга
  if (g.includes('visual') || g.includes('novel')) return { color: '#d946ef', icon: <Book size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };

  if (g.includes('action') || g.includes('hack') || g.includes('fighting')) return { color: '#dc2626', icon: <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('shooter') || g.includes('fps')) return { color: '#b91c1c', icon: <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('adventure')) return { color: '#059669', icon: <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('rpg')) return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('rogue') || g.includes('dungeon')) return { color: '#d97706', icon: <Skull size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('metroidvania') || g.includes('platformer')) return { color: '#db2777', icon: <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('strategy') || g.includes('card')) return { color: '#2563eb', icon: <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('sim') || g.includes('craft') || g.includes('building')) return { color: '#d97706', icon: <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('horror')) return { color: '#9f1239', icon: <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('sport')) return { color: '#7c3aed', icon: <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('racing')) return { color: '#ea580c', icon: <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('space') || g.includes('sci-fi')) return { color: '#4f46e5', icon: <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('puzzle')) return { color: '#c026d3', icon: <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('music')) return { color: '#65a30d', icon: <Music size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('casual') || g.includes('indie')) return { color: '#0891b2', icon: <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  
  return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
};

const GameCard: React.FC<GameCardProps> = memo(({ game, onOpenModal, isFavorite, onToggleFavorite, style }) => {
  const coopInfo = getCoopDetails(game.normalizedCoop);
  const genreInfo = getGenreDetails(game.normalizedGenre);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(game.id);
    }
  };

  return (
    <div className="game-card-wrapper" style={style}>
      <div className="game-card-inner" onClick={() => onOpenModal(game)}>
        
        {/* КАРТИНКА + БЕЙДЖИ + СЕРДЕЧКО */}
        <div className="game-card-image">
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy" 
          />

          <div className="card-badges">
            <div className="badge" style={{ borderColor: genreInfo.color }}>
               <span className="badge-icon" style={{ color: genreInfo.color }}>{genreInfo.icon}</span>
               {game.genre}
            </div>
            <div className="badge" style={{ borderColor: coopInfo.color }}>
               <span className="badge-icon" style={{ color: coopInfo.color }}>{coopInfo.icon}</span>
               {coopInfo.label}
            </div>
          </div>

          {onToggleFavorite && (
            <button 
              className={`card-favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
            >
              <Heart size={16} fill={isFavorite ? "#ef4444" : "currentColor"} color={isFavorite ? "#ef4444" : "white"} />
            </button>
          )}
        </div>

        {/* КОНТЕНТ */}
        <div className="card-content">
          <div className="card-header-row">
            <h3 className="card-title" title={game.name}>{game.name}</h3>
            {game.steamurl && (
              <a 
                href={game.steamurl} 
                target="_blank" 
                rel="noreferrer" 
                className="steam-icon-link"
                onClick={(e) => e.stopPropagation()}
                title="Open in Steam"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          {/* ОПИСАНИЕ */}
          <div className="card-description-overlay">
             {game.description}
          </div>

          {/* ПОХОЖИЕ ИГРЫ */}
          <div className="card-similar-section">
            <div className="similar-label">Similar Games</div>
            <div className="card-similar-grid">
               {game.similargames && game.similargames.length > 0 ? (
                 game.similargames.slice(0, 3).map((sim: any, i: number) => (
                   <div key={i} className="card-similar-item" title={sim.name}>
                     <img src={sim.image} alt={sim.name} loading="lazy" />
                   </div>
                 ))
               ) : (
                 <span className="no-similar">No suggestions</span>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default GameCard;
