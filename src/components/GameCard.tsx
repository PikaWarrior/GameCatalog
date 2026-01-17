import React, { memo } from 'react';
import { Gamepad2 } from 'lucide-react'; // Убедитесь, что иконка импортирована
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style }) => {
  // Показываем только 3 главных поджанра, чтобы не перегружать карту
  const visibleSubgenres = game.subgenres.slice(0, 3);
  const hiddenCount = game.subgenres.length - visibleSubgenres.length;

  return (
    <div className="game-card" style={style}>
      {/* Контейнер изображения с градиентом */}
      <div className="game-card__image-wrap">
        <img 
          src={game.image} 
          alt={game.name}
          className="game-card__image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/fallback-game.jpg';
          }}
        />
        <div className="game-card__overlay" />
        
        {/* Бейджи жанра и коопа поверх картинки */}
        <div className="game-card__badges">
          <span className="badge badge--genre">{game.genre}</span>
          <span className="badge badge--coop">{game.normalizedCoop}</span>
        </div>
      </div>

      <div className="game-card__content">
        <div className="game-card__header">
          <h3 className="game-card__title" title={game.name}>
            {game.name}
          </h3>
          {/* Рейтинг (если есть в данных) можно добавить сюда */}
        </div>

        <p className="game-card__description">
          {game.description || "Описание отсутствует..."}
        </p>

        {/* Компактный список тегов */}
        <div className="game-card__tags">
          {visibleSubgenres.map((sub, i) => (
            <span key={i} className="tag">
              {sub}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="tag tag--more">+{hiddenCount}</span>
          )}
        </div>

        {/* Кнопка действия (появляется при ховере) */}
        <a 
          href={game.steam_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="game-card__action-btn"
        >
          <Gamepad2 size={18} />
          <span>В Steam</span>
        </a>
      </div>
    </div>
  );
});

export default GameCard;
