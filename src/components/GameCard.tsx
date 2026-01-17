import React, { memo, useState } from 'react';
import { Gamepad2, Monitor, Globe, Users, ArrowUpRight } from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onClick?: (game: ProcessedGame) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Логика иконок и цветов для режимов (адаптирована под новые стили)
  const getCoopBadgeStyle = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return { 
      color: '#10b981', 
      rgb: '16, 185, 129', 
      icon: <Globe size={11} />, 
      label: 'Online' 
    };
    if (lower.includes('local') || lower.includes('shared') || lower.includes('split')) return { 
      color: '#f59e0b', 
      rgb: '245, 158, 11', 
      icon: <Users size={11} />, 
      label: 'Local' 
    };
    if (lower.includes('single')) return { 
      color: '#94a3b8', 
      rgb: '148, 163, 184', 
      icon: <Monitor size={11} />, 
      label: 'Single' 
    };
    return { 
      color: '#3b82f6', 
      rgb: '59, 130, 246', 
      icon: <Gamepad2 size={11} />, 
      label: coop.split(' ')[0] 
    };
  };

  const badgeConfig = getCoopBadgeStyle(game.normalizedCoop);
  
  // Ограничиваем теги до 3 штук
  const visibleSubgenres = game.subgenres.slice(0, 3);
  const hiddenCount = game.subgenres.length - 3;

  return (
    <article 
      className={`game-card ${imageLoaded ? 'is-visible' : ''}`}
      style={{ 
        ...style, 
        '--badge-color-rgb': badgeConfig.rgb 
      } as React.CSSProperties}
      onClick={() => onClick && onClick(game)}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick(game)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${game.name}`}
    >
      {/* Световой блик (Shine Effect) - сохранили из предыдущих улучшений */}
      <div className="shine-effect" />

      {/* --- ИЗОБРАЖЕНИЕ --- */}
      <div className="game-card__image-wrap">
        <div className={`game-card__image-blur ${imageLoaded ? 'hidden' : ''}`}>
           {/* Блюр-заглушка или скелетон */}
        </div>
        
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
        
        <div className="game-card__overlay" />

        {/* Бейджи */}
        <div className="game-card__badges">
          <span className="badge badge--genre">{game.genre}</span>
          <span className="badge badge--coop">
            {badgeConfig.icon}
            <span>{badgeConfig.label}</span>
          </span>
        </div>
      </div>

      {/* --- КОНТЕНТ --- */}
      <div className="game-card__content">
        <div className="game-card__header">
          <h3 className="game-card__title" title={game.name}>
            {game.name}
          </h3>
        </div>

        <div className="game-card__description-wrap">
           <p className="game-card__description">
             {game.description || "Описание недоступно."}
           </p>
        </div>

        {/* Футер */}
        <div className="game-card__footer">
          <div className="game-card__tags">
            {visibleSubgenres.map((sub, i) => (
              <span key={i} className="tag">{sub}</span>
            ))}
            {hiddenCount > 0 && <span className="tag tag--more">+{hiddenCount}</span>}
          </div>

          <a 
            href={game.steam_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="steam-icon-btn"
            onClick={(e) => e.stopPropagation()}
            title="Открыть в Steam"
          >
            <Gamepad2 size={16} />
            <span>Steam</span>
            <ArrowUpRight size={12} style={{ opacity: 0.5 }} />
          </a>
        </div>
      </div>
    </article>
  );
});

export default GameCard;
