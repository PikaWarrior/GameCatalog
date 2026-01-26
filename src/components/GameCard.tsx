import React, { memo } from 'react';
import { Gamepad2 } from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onOpenModal?: (game: ProcessedGame) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style, onOpenModal }) => {
  
  const getCoopIcon = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return '🌐';
    if (lower.includes('lan')) return '🏠';
    if (lower.includes('shared') || lower.includes('split')) return '📺';
    return '👤';
  };

  const getGenreColor = (genre: string) => {
    const g = genre.toLowerCase();
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting')) return 'var(--genre-red)';
    if (g.includes('adventure') || g.includes('rpg') || g.includes('metroidvania')) return 'var(--genre-green)';
    if (g.includes('strategy') || g.includes('simulation') || g.includes('sandbox')) return 'var(--genre-blue)';
    if (g.includes('horror') || g.includes('survival')) return 'var(--genre-purple)';
    if (g.includes('puzzle') || g.includes('platformer')) return 'var(--genre-yellow)';
    if (g.includes('rogue')) return 'var(--genre-orange)';
    return 'var(--genre-default)';
  };

  const getCoopColorClass = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online') || lower.includes('co-op') || lower.includes('multiplayer') || lower.includes('split')) {
      return 'coop-online';
    }
    return 'coop-single';
  };

  return (
    <div 
      className="game-card-container" 
      style={style}
    >
      <div 
        className="game-card-inner"
        onClick={() => onOpenModal && onOpenModal(game)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onOpenModal && onOpenModal(game);
          }
        }}
        tabIndex={0}
        role="button"
      >
        {/* Картинка и Бейджи */}
        <div className="card-image-container">
          <img 
            src={game.image} 
            alt={game.name} 
            className="card-image"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/fallback-game.jpg';
            }}
          />
          <div className="card-image-overlay" />
          
          <div className="card-badges">
            <span className="badge" style={{ backgroundColor: getGenreColor(game.genre) }}>
              {game.genre}
            </span>
            <span className={`badge coop ${getCoopColorClass(game.coop)}`}>
              {getCoopIcon(game.coop)} {game.normalizedCoop}
            </span>
          </div>
        </div>

        {/* Контент */}
        <div className="card-content">
          <h3 className="card-title" title={game.name}>{game.name}</h3>
          
          <div className="card-description-static">
             <div dangerouslySetInnerHTML={{ __html: game.sanitizedDescription || "No description available." }} />
          </div>

          <div className="card-tags">
            {game.subgenres.slice(0, 5).map((sub, i) => (
              <span key={`sg-${i}`} className="tag subgenre-tag">{sub}</span>
            ))}
            {game.subgenres.length > 5 && (
              <span className="tag more-tag">+{game.subgenres.length - 5}</span>
            )}
          </div>

          <a 
            href={game.steam_url || '#'} 
            className="steam-button"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Gamepad2 size={16} />
            {game.steam_url ? 'In Steam' : 'No Link'}
          </a>
        </div>
      </div>
    </div>
  );
});

export default GameCard;
