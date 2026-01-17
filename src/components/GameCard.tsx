import React, { memo, useState } from 'react';
import { Gamepad2, Monitor, Globe, Users } from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onClick?: (game: ProcessedGame) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // 1. Конфиг цветов бейджей (Кооп) с мягкими фонами
  const getCoopBadgeStyle = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <Globe size={11} />, label: 'Online' };
    if (lower.includes('local') || lower.includes('shared')) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <Users size={11} />, label: 'Local' };
    if (lower.includes('single')) return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', icon: <Monitor size={11} />, label: 'Single' };
    return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: <Gamepad2 size={11} />, label: coop.split(' ')[0] };
  };

  const badgeConfig = getCoopBadgeStyle(game.normalizedCoop);

  // 2. Логика тегов (Максимум 3)
  const MAX_TAGS = 3;
  const visibleSubgenres = game.subgenres.slice(0, MAX_TAGS);
  const hiddenCount = game.subgenres.length - MAX_TAGS;

  return (
    <article 
      className="game-card group" 
      style={style}
      onClick={() => onClick && onClick(game)}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick(game)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${game.name}`}
    >
      {/* Световой блик (Shine Effect) при ховере */}
      <div className="shine-effect" />

      {/* --- ИЗОБРАЖЕНИЕ --- */}
      <div className="game-card__image-wrap">
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
        
        <div className="game-card__overlay" />
        
        {/* Верхний стеклянный бейдж (Жанр) */}
        <div className="game-card__top-badges">
           <span className="badge-glass">{game.genre}</span>
        </div>
      </div>

      {/* --- КОНТЕНТ --- */}
      <div className="game-card__content">
        
        {/* Заголовок */}
        <div className="game-card__header">
            {!imageLoaded ? <div className="skeleton-title" /> : (
                <h3 className="game-card__title" title={game.name}>{game.name}</h3>
            )}
        </div>
        
        {/* Описание */}
        <div className="game-card__description-wrap">
           {!imageLoaded ? (
               <>
                 <div className="skeleton-text" />
                 <div className="skeleton-text" style={{ width: '80%' }} />
               </>
           ) : (
               <p className="game-card__description">
                 {game.description || "Описание недоступно."}
               </p>
           )}
        </div>

        <div className="divider" />

        {/* Футер: Кооп + Теги + Steam */}
        <div className="game-card__footer">
          <div className="footer-left">
            {/* Умный бейдж Кооператива */}
            <div 
                className="coop-indicator" 
                style={{ color: badgeConfig.color, background: badgeConfig.bg }}
            >
                {badgeConfig.icon}
                <span>{badgeConfig.label}</span>
            </div>

            {/* Теги в стиле "мини-список" */}
            <div className="mini-tags">
                {visibleSubgenres.map((sub, i) => (
                    <span key={i} className="mini-tag">{sub}</span>
                ))}
                {hiddenCount > 0 && <span className="mini-tag more">+{hiddenCount}</span>}
            </div>
          </div>

          <a 
            href={game.steam_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="steam-icon-btn"
            onClick={(e) => e.stopPropagation()}
            title="Открыть в Steam"
          >
            <Gamepad2 size={18} />
          </a>
        </div>
      </div>
    </article>
  );
});

export default GameCard;
