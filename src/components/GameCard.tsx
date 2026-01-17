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

  // Определение стиля бейджа кооператива
  const getCoopBadgeStyle = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return { color: '#10b981', icon: <Globe size={12} />, label: 'Online' }; // Emerald Green
    if (lower.includes('local') || lower.includes('shared') || lower.includes('split')) return { color: '#f59e0b', icon: <Users size={12} />, label: 'Local' }; // Amber
    if (lower.includes('single')) return { color: '#64748b', icon: <Monitor size={12} />, label: 'Single' }; // Slate
    return { color: '#3b82f6', icon: <Gamepad2 size={12} />, label: coop.split(' ')[0] }; // Default Blue
  };

  const badgeConfig = getCoopBadgeStyle(game.normalizedCoop);

  // Логика отображения тегов (максимум 3)
  const MAX_TAGS = 3;
  const visibleSubgenres = game.subgenres.slice(0, MAX_TAGS);
  const hiddenCount = game.subgenres.length - MAX_TAGS;
  // Собираем скрытые теги для тултипа
  const hiddenTagsString = hiddenCount > 0 ? game.subgenres.slice(MAX_TAGS).join(', ') : '';

  // Обработчик клика по кнопке Steam
  const handleSteamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
      {/* --- ИЗОБРАЖЕНИЕ --- */}
      <div className="game-card__image-wrap">
        {/* Скелетон загрузки картинки */}
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
        
        {/* Затемнение и Бейджи */}
        <div className="game-card__overlay" />
        <div className="game-card__badges">
          <span className="badge badge--genre">{game.genre}</span>
          <span 
            className="badge badge--coop" 
            style={{ backgroundColor: badgeConfig.color }}
          >
            {badgeConfig.icon}
            <span style={{ marginLeft: 5 }}>{badgeConfig.label}</span>
          </span>
        </div>
      </div>

      {/* --- КОНТЕНТ --- */}
      <div className="game-card__content">
        {/* Заголовок (со скелетоном) */}
        {!imageLoaded ? (
            <div className="skeleton-title" />
        ) : (
            <h3 className="game-card__title" title={game.name}>{game.name}</h3>
        )}
        
        {/* Описание (со скелетоном и маской) */}
        <div className="game-card__description-wrap">
           {!imageLoaded ? (
               <>
                 <div className="skeleton-text" />
                 <div className="skeleton-text" style={{ width: '80%' }} />
                 <div className="skeleton-text" style={{ width: '60%' }} />
               </>
           ) : (
               <p className="game-card__description">
                 {game.description || "Описание отсутствует."}
               </p>
           )}
        </div>

        {/* Футер: Теги и Steam */}
        <div className="game-card__footer">
          <div className="game-card__tags">
            {visibleSubgenres.map((sub, i) => (
              <span key={i} className="tag">{sub}</span>
            ))}
            {hiddenCount > 0 && (
                <span 
                  className="tag tag--more" 
                  title={`Еще: ${hiddenTagsString}`}
                >
                  +{hiddenCount}
                </span>
            )}
          </div>

          <a 
            href={game.steam_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="steam-icon-btn"
            onClick={handleSteamClick}
            title="Открыть в Steam"
          >
            <Gamepad2 size={20} />
          </a>
        </div>
      </div>
    </article>
  );
});

export default GameCard;
