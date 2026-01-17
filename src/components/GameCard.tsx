import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Heart, Monitor, Globe, Users, ChevronRight } from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onClick?: (game: ProcessedGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  interactive?: boolean;
  showQuickActions?: boolean;
  index?: number;
}

const COOP_BADGE_CONFIG = {
  online: { color: '#10b981', icon: <Globe size={12} />, label: 'Online' },
  local: { color: '#f59e0b', icon: <Users size={12} />, label: 'Local' },
  shared: { color: '#f59e0b', icon: <Users size={12} />, label: 'Local' },
  split: { color: '#f59e0b', icon: <Users size={12} />, label: 'Local' },
  single: { color: '#64748b', icon: <Monitor size={12} />, label: 'Single' },
} as const;

const GameCard: React.FC<GameCardProps> = memo(({ 
  game, 
  style, 
  onClick, 
  isFavorite = false, 
  onToggleFavorite,
  variant = 'default',
  interactive = true,
  showQuickActions = false,
  index = 0
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const animationDelay = index * 50;

  const getCoopBadgeStyle = useCallback((coop: string) => {
    const lower = coop.toLowerCase();
    for (const key in COOP_BADGE_CONFIG) {
      if (lower.includes(key)) {
        return COOP_BADGE_CONFIG[key as keyof typeof COOP_BADGE_CONFIG];
      }
    }
    return { color: '#3b82f6', icon: <Gamepad2 size={12} />, label: coop.split(' ')[0] };
  }, []);

  useEffect(() => {
    if (!game.image) {
      setImageLoaded(true);
      return;
    }
    
    const img = new Image();
    img.src = game.image;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
  }, [game.image]);

  const badgeConfig = getCoopBadgeStyle(game.normalizedCoop);
  const visibleSubgenres = game.subgenres.slice(0, variant === 'compact' ? 2 : 3);
  const hiddenCount = game.subgenres.length - visibleSubgenres.length;
  const hasSteamLink = game.steam_url && game.steam_url.startsWith('http');

  const handleCardClick = useCallback(() => {
    if (interactive && onClick) onClick(game);
  }, [interactive, onClick, game]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(game.id);
  }, [onToggleFavorite, game.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (interactive) handleCardClick();
    }
    if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (onToggleFavorite) onToggleFavorite(game.id);
    }
  }, [interactive, handleCardClick, onToggleFavorite, game.id]);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleTagClick = useCallback((e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    console.log('Filter by tag:', tag);
  }, []);

  const renderQuickActions = () => {
    if (!showQuickActions || !isHovered) return null;
    
    return (
      <div className="game-card__quick-actions">
        <button className="quick-action-btn" title="Add to collection">
          <span>+</span>
        </button>
        <button className="quick-action-btn" title="Compare games">
          <span>≈</span>
        </button>
        <button className="quick-action-btn" title="Share">
          <span>↗</span>
        </button>
      </div>
    );
  };

  return (
    <article 
      ref={cardRef}
      className={`game-card game-card--${variant} group ${isPressed ? 'pressed' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{ ...style, '--animation-delay': `${animationDelay}ms` } as React.CSSProperties}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? "button" : "article"}
      aria-label={`Game: ${game.name}. ${game.genre}. ${game.normalizedCoop}. ${game.description?.substring(0, 100)}...`}
      data-testid="game-card"
      data-game-id={game.id}
    >
      <div className="game-card__image-wrap">
        <div className={`skeleton-loader ${imageLoaded ? 'hidden' : ''}`} />
        
        {game.imageLowRes && !imageLoaded && (
          <img 
            src={game.imageLowRes}
            alt=""
            className="game-card__image-blur"
          />
        )}
        
        <img 
          src={game.image || '/fallback-game.jpg'}
          alt={`Cover art for ${game.name}`}
          className={`game-card__image ${imageLoaded ? 'loaded' : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/fallback-game.jpg';
            setImageLoaded(true);
          }}
        />
        
        <div className="game-card__overlay" />
        
        <div className="game-card__badges">
          <span className="badge badge--genre" title={game.genre}>
            {game.genre}
          </span>
          <span 
            className="badge badge--coop"
            style={{ '--badge-color': badgeConfig.color } as React.CSSProperties}
            title={`Co-op type: ${game.normalizedCoop}`}
          >
            {badgeConfig.icon}
            <span>{badgeConfig.label}</span>
          </span>
        </div>

        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          data-testid="favorite-btn"
        >
          <Heart 
            size={18} 
            fill={isFavorite ? "currentColor" : "none"}
            className={isFavorite ? "animate-heartbeat" : ""}
          />
        </button>

        {interactive && (
          <div className="view-details-indicator">
            <ChevronRight size={20} />
            <span>View details</span>
          </div>
        )}
      </div>

      <div className="game-card__content">
        <div className="game-card__header">
          {!imageLoaded ? (
            <div className="skeleton-title" />
          ) : (
            <>
              <h3 className="game-card__title" title={game.name}>
                {game.name}
              </h3>
              {game.developer && variant === 'detailed' && (
                <div className="game-card__developer">
                  by {game.developer}
                </div>
              )}
            </>
          )}
        </div>

        <div className="game-card__description-wrap">
          {!imageLoaded ? (
            <>
              <div className="skeleton-text" />
              <div className="skeleton-text" style={{ width: '70%' }} />
            </>
          ) : (
            <p 
              className="game-card__description"
              title={game.description || "No description available"}
            >
              {game.description || "No description available."}
            </p>
          )}
        </div>

        <div className="game-card__footer">
          <div className="game-card__tags">
            {visibleSubgenres.map((sub, i) => (
              <button 
                key={i}
                className="tag"
                onClick={(e) => handleTagClick(e, sub)}
                title={`Filter by ${sub}`}
                aria-label={`Filter by ${sub}`}
              >
                {sub}
              </button>
            ))}
            {hiddenCount > 0 && (
              <span 
                className="tag tag--more"
                title={`${hiddenCount} more tags: ${game.subgenres.slice(3).join(', ')}`}
              >
                +{hiddenCount}
              </span>
            )}
          </div>

          {hasSteamLink && (
            <a 
              href={game.steam_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="steam-icon-btn"
              onClick={(e) => e.stopPropagation()}
              title={`Open ${game.name} on Steam`}
              aria-label={`Open ${game.name} on Steam`}
            >
              <Gamepad2 size={20} />
              {variant === 'detailed' && <span>Steam</span>}
            </a>
          )}
        </div>

        {renderQuickActions()}
      </div>
    </article>
  );
});

GameCard.displayName = 'GameCard';
export default GameCard;
