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

  // Функция выбора иконки для кооператива
  const getCoopIcon = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return '🌐';
    if (lower.includes('lan')) return '🏠';
    if (lower.includes('shared') || lower.includes('split')) return '📺';
    return '👤';
  };

  // Логика выбора цвета для жанра (ОБНОВЛЕННАЯ)
  const getGenreColor = (genre: string) => {
    const g = genre.toLowerCase();
    
    // Экшен, Файтинг, Шутер -> Красный
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack')) return 'var(--genre-red)';
    
    // RPG, Adventure, Metroidvania -> Зеленый
    if (g.includes('adventure') || g.includes('rpg') || g.includes('role') || g.includes('metroidvania')) return 'var(--genre-green)';
    
    // Стратегии, Симуляторы -> Синий
    if (g.includes('strategy') || g.includes('simulation') || g.includes('management') || g.includes('city') || g.includes('sandbox')) return 'var(--genre-blue)';
    
    // Хоррор, Выживание -> Фиолетовый
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) return 'var(--genre-purple)';
    
    // Пазлы, Платформеры -> Желтый
    if (g.includes('puzzle') || g.includes('platformer') || g.includes('arcade')) return 'var(--genre-yellow)';
    
    // Рогалики -> Оранжевый (используем существующий или добавляем новый класс в CSS)
    if (g.includes('rogue') || g.includes('lite') || g.includes('dungeon')) return 'var(--genre-orange)';
    
    return 'var(--genre-default)';
  };

  // Логика выбора цвета для режима
  const getCoopColorClass = (coop: string) => {
    const lower = coop.toLowerCase();
    if (
      lower.includes('online') || 
      lower.includes('co-op') || 
      lower.includes('multiplayer') || 
      lower.includes('split') || 
      lower.includes('lan')
    ) {
      return 'coop-online';
    }
    return 'coop-single';
  };

  const genreColor = getGenreColor(game.genre);
  const coopClass = getCoopColorClass(game.coop);

  return (
    <div 
      className="game-card" 
      style={style}
      onClick={() => onOpenModal && onOpenModal(game)}
      title="Нажмите для просмотра полного описания"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenModal && onOpenModal(game);
        }
      }}
    >
      <div className="card-image-container">
        <img 
          src={game.image} 
          alt={game.name} 
          className="game-image" 
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/fallback-game.jpg';
          }}
        />
        <div className="card-badges">
          <span className="genre-badge" style={{ backgroundColor: genreColor }}>
            {game.genre}
          </span>
          <span className={`coop-badge ${coopClass}`}>
            {getCoopIcon(game.coop)} {game.normalizedCoop}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="game-title">{game.name}</h3>
        
        {/* УВЕЛИЧЕННОЕ ОПИСАНИЕ */}
        <p className="game-description">
          {game.description || "Описание отсутствует..."}
        </p>
        
        <div className="tags-container">
          {game.subgenres.slice(0, 6).map((sub, i) => (
            <span key={i} className="tag-badge">
              {sub}
            </span>
          ))}
          {game.subgenres.length > 6 && (
            <span className="tag-badge more-tags">
              +{game.subgenres.length - 6}
            </span>
          )}
        </div>
        
        <a 
          href={game.steam_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="steam-link"
          onClick={(e) => e.stopPropagation()}
        >
          <Gamepad2 size={16} style={{ marginRight: '6px' }} />
          В Steam
        </a>
      </div>
    </div>
  );
});

export default GameCard;
