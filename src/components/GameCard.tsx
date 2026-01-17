import React, { memo } from 'react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style }) => {
  const getCoopIcon = (coop: string) => {
    if (coop.includes('Online')) return '🌐';
    if (coop.includes('LAN')) return '🏠';
    if (coop.includes('Shared')) return '📺';
    return '👤';
  };

  return (
    <div className="game-card" style={style}>
      <div className="game-card-inner">
        <div className="card-image-container">
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy"
            className="card-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/fallback-game.jpg';
            }}
          />
          <div className="card-badges">
            <span className="badge genre">{game.genre}</span>
            <span className="badge coop" title={game.coop}>
              {getCoopIcon(game.coop)} {game.normalizedCoop}
            </span>
          </div>
        </div>

        <div className="card-content">
          <h3 className="card-title" title={game.name}>
            {game.name}
          </h3>

          <div className="card-description-scroll custom-scrollbar">
            {game.description || "Описание отсутствует..."}
          </div>

          <div className="card-tags">
            {[...game.tags, ...game.subgenres].slice(0, 4).map((tag, i) => (
              <span key={i} className="tag">#{tag}</span>
            ))}
          </div>

          <a 
            href={game.steam_url}
            target="_blank" 
            rel="noopener noreferrer"
            className="steam-button"
          >
            <span className="steam-icon">🎮</span>
            В Steam
          </a>
        </div>
      </div>
    </div>
  );
});

export default GameCard;
