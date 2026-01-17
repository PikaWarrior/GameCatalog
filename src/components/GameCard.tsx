import React, { memo, useState } from 'react';
import { Gamepad2, Heart, Monitor, Globe, Users } from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onClick?: (game: ProcessedGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ 
  game, 
  style, 
  onClick, 
  isFavorite = false, 
  onToggleFavorite 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Логика определения цвета и иконки для типа кооператива
  const getCoopBadgeStyle = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return { color: '#10b981', icon: <Globe size={12} />, label: 'Online' }; // Green
    if (lower.includes('local') || lower.includes('shared') || lower.includes('split')) return { color: '#f59e0b', icon: <Users size={12} />, label: 'Local' }; // Amber
    if (lower.includes('single')) return { color: '#64748b', icon: <Monitor size={12} />, label: 'Single' }; // Slate
    return { color: '#3b82f6', icon: <Gamepad2 size={12} />, label: coop.split(' ')[0] }; // Default Blue
  };

  const badgeConfig = getCoopBadgeStyle(game.normalizedCoop);
  const visibleSubgenres = game.subgenres.slice(0, 3);
  const hiddenCount = game.subgenres.length - visibleSubgenres.length;

  // Обработчик клика по карточке
  const handleCardClick = () => {
    if (onClick) onClick(game);
  };

  // Обработчик клика по избранному
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(game.id);
  };

  // Обработчик клика по Steam
  const handleSteamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <article 
      className="game-card group" 
      style={style}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${game.name}`}
    >
      <div className="game-card__image-wrap">
        {/* Скелетон (показывается, пока imageLoaded === false) */}
        <div className={`skeleton-loader ${imageLoaded ? 'hidden' : ''}`} />
        
        <img 
          src={game.image} 
          alt="" 
          className={`game-card__image ${imageLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/fallback-game.jpg';
            setImageLoaded(true);
          }}
        />
        
        {/* Затемнение снизу картинки */}
        <div className="game-card__overlay" />

        {/* Бейджи */}
        <div className="game-card__badges">
          <span className="badge badge--genre">{game.genre}</span>
          <span 
            className="badge badge--coop" 
            style={{ backgroundColor: badgeConfig.color }}
          >
            {badgeConfig.icon}
            <span style={{ marginLeft: 4 }}>{badgeConfig.label}</span>
          </span>
        </div>

        {/* Кнопка избранного */}
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="game-card__content">
        {/* Заголовок. Показываем заглушку, если картинка не загрузилась (опционально) */}
        {!imageLoaded ? (
            <div className="skeleton-title" />
        ) : (
            <h3 className="game-card__title" title={game.name}>{game.name}</h3>
        )}
        
        <div className="game-card__description-wrap">
           {!imageLoaded ? (
               <>
                 <div className="skeleton-text" />
                 <div className="skeleton-text" style={{ width: '70%' }} />
               </>
           ) : (
               <p className="game-card__description">
                 {game.description || "No description available."}
               </p>
           )}
        </div>

        <div className="game-card__footer">
          <div className="game-card__tags">
            {visibleSubgenres.map((sub, i) => (
              <span key={i} className="tag">{sub}</span>
            ))}
            {hiddenCount > 0 && (
                <span className="tag tag--more">+{hiddenCount}</span>
            )}
          </div>

          <a 
            href={game.steam_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="steam-icon-btn"
            onClick={handleSteamClick}
            title="Open in Steam"
          >
            <Gamepad2 size={20} />
          </a>
        </div>
      </div>
    </article>
  );
});

export default GameCard;
