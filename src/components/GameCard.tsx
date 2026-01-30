import React, { memo } from 'react';
import { ProcessedGame } from '../types';
import { 
  User, 
  Users, 
  Monitor, 
  Globe, 
  Sword, 
  Crosshair, 
  Map, 
  Scroll, 
  Skull, 
  Dna, 
  Brain, 
  Hammer, 
  Ghost, 
  Trophy, 
  Car, 
  Rocket, 
  Puzzle, 
  Music, 
  Coffee, 
  Gamepad2,
  Heart
} from 'lucide-react';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  onClick: (game: ProcessedGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  style?: React.CSSProperties; // 🆕 Добавлено свойство style
}

const ICON_SIZE = 14;
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
  if (g.includes('action') || g.includes('hack') || g.includes('fighting')) return { color: '#dc2626', icon: <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('shooter') || g.includes('fps')) return { color: '#b91c1c', icon: <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('adventure')) return { color: '#059669', icon: <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('rpg')) return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('rogue') || g.includes('dungeon')) return { color: '#d97706', icon: <Skull size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('metroidvania') || g.includes('platformer')) return { color: '#db2777', icon: <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('strategy') || g.includes('card')) return { color: '#2563eb', icon: <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('sim') || g.includes('craft')) return { color: '#d97706', icon: <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('horror')) return { color: '#9f1239', icon: <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('sport')) return { color: '#7c3aed', icon: <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('racing')) return { color: '#ea580c', icon: <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('space') || g.includes('sci-fi')) return { color: '#4f46e5', icon: <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('puzzle')) return { color: '#c026d3', icon: <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('music')) return { color: '#65a30d', icon: <Music size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  if (g.includes('casual') || g.includes('indie')) return { color: '#0891b2', icon: <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
};

const GameCard: React.FC<GameCardProps> = memo(({ game, onClick, isFavorite, onToggleFavorite, style }) => {
  const coopInfo = getCoopDetails(game.normalizedCoop);
  const genreInfo = getGenreDetails(game.normalizedGenre);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(game.id);
    }
  };

  return (
    <div className="game-card" onClick={() => onClick(game)} style={style}>
      <div className="card-image-wrapper">
        <img 
          src={game.image} 
          alt={game.name} 
          className="card-image"
          loading="lazy" 
        />
        <div className="card-overlay">
          {onToggleFavorite && (
            <button 
              className={`fav-btn ${isFavorite ? 'active' : ''}`} 
              onClick={handleFavoriteClick}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
        
        {/* Steam Link Icon in corner */}
        {game.steamurl && (
           <a 
             href={game.steamurl} 
             target="_blank" 
             rel="noreferrer" 
             className="card-steam-link"
             onClick={(e) => e.stopPropagation()}
             title="Open Steam Store"
           >
             <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
               <path d="M11.979 0C5.666 0 .502 4.909 0 11.127l3.626 5.292c.074.07.21.128.283.056l.088-.088c2.269-2.222 5.923-2.247 8.217-.06 2.378 2.268 2.35 6.07-.064 8.29l5.066 3.73C21.464 25.12 24 20.8 24 15.174 23.977 6.645 18.736 0 11.979 0zM8.36 17.58c-1.122 1.107-2.91 1.077-3.996-.067-1.084-1.144-1.054-2.964.067-4.07 1.121-1.108 2.91-1.078 3.995.066 1.085 1.144 1.055 2.964-.066 4.071zm8.385 1.556c-.66.652-1.713.634-2.352-.04-.64-.672-.62-1.744.04-2.395.66-.652 1.713-.634 2.352.04.64.672.62 1.745-.04 2.395z" />
             </svg>
           </a>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-title" title={game.name}>{game.name}</h3>
        
        <div className="tags-row">
          <span 
            className="badge" 
            style={{ 
              backgroundColor: `${genreInfo.color}20`, 
              color: genreInfo.color,
              borderColor: `${genreInfo.color}40`
            }}
          >
            <span className="badge-icon">{genreInfo.icon}</span>
            {game.genre}
          </span>

          <span 
            className="badge"
            style={{ 
              backgroundColor: `${coopInfo.color}20`, 
              color: coopInfo.color,
              borderColor: `${coopInfo.color}40`
            }}
          >
            <span className="badge-icon">{coopInfo.icon}</span>
            {coopInfo.label}
          </span>
        </div>

        {/* Similar Games Preview */}
        {game.similargames && game.similargames.length > 0 && (
          <div className="similar-preview">
             <span className="similar-label">Similar: </span>
             <span className="similar-values">
               {game.similargames.slice(0, 2).map((s: any) => s.name).join(', ')}
               {game.similargames.length > 2 && ` +${game.similargames.length - 2}`}
             </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default GameCard;
