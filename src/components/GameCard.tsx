import React, { memo } from 'react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style }) => {
  const getCoopIcon = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return '🌐';
    if (lower.includes('lan')) return '🏠';
    if (lower.includes('shared') || lower.includes('split')) return '📺';
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

          {/* ОБНОВЛЕННЫЙ БЛОК ТЕГОВ И ПОДЖАНРОВ */}
          <div className="card-tags">
            {/* Сначала Поджанры (выделенные) */}
            {game.subgenres.slice(0, 3).map((sub, i) => (
              <span key={`sub-${i}`} className="tag subgenre-tag">
                {sub}
              </span>
            ))}
            
            {/* Потом обычные теги */}
            {game.tags.slice(0, 4).map((tag, i) => (
              <span key={`tag-${i}`} className="tag">
                #{tag}
              </span>
            ))}

            {/* Счетчик оставшихся */}
            {(game.subgenres.length + game.tags.length) > 7 && (
               <span className="tag more-tag">
                 +{(game.subgenres.length + game.tags.length) - 7}
               </span>
            )}
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
