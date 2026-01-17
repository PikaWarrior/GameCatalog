import React, { memo } from 'react';
import { Gamepad2, Maximize2 } from 'lucide-react';
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

  return (
    <div className="game-card-inner" style={style}>
      {/* Изображение и Бейджи */}
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
        <div className="card-badges">
          <span className="badge genre">{game.genre}</span>
          <span className="badge coop">
             {getCoopIcon(game.coop)} {game.normalizedCoop}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title" title={game.name}>{game.name}</h3>
        
        {/* Интерактивное описание: клик открывает модалку */}
        <div 
            className="card-description-area"
            onClick={() => onOpenModal && onOpenModal(game)}
            title="Нажмите, чтобы открыть полное описание"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenModal && onOpenModal(game);
              }
            }}
        >
           <p className="description-text">
             {game.description || "Описание отсутствует..."}
           </p>
           
           {/* Всплывающая подсказка "Подробнее" */}
           <div className="expand-hint">
             <Maximize2 size={14} /> <span>Подробнее</span>
           </div>
        </div>

        {/* Теги (Поджанры) */}
        <div className="card-tags">
          {game.subgenres.slice(0, 6).map((sub, i) => (
            <span key={i} className="tag subgenre-tag">{sub}</span>
          ))}
          {game.subgenres.length > 6 && (
            <span className="tag more-tag">+{game.subgenres.length - 6}</span>
          )}
        </div>

        {/* Кнопка Steam */}
        <a 
          href={game.steam_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="steam-button"
          onClick={(e) => e.stopPropagation()} /* Чтобы клик не вызывал модалку */
        >
          <Gamepad2 size={18} className="steam-icon"/>
          <span>В Steam</span>
        </a>
      </div>
    </div>
  );
});

export default GameCard;
