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

  // Логика выбора цвета для жанра
  const getGenreColor = (genre: string) => {
      const g = genre.toLowerCase();
      if (g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack')) return 'var(--genre-red)';
      if (g.includes('adventure') || g.includes('rpg') || g.includes('role')) return 'var(--genre-green)';
      if (g.includes('strategy') || g.includes('simulation') || g.includes('management') || g.includes('city')) return 'var(--genre-blue)';
      if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) return 'var(--genre-purple)';
      if (g.includes('puzzle') || g.includes('platformer') || g.includes('arcade')) return 'var(--genre-yellow)';
      if (g.includes('rogue') || g.includes('lite') || g.includes('dungeon')) return 'var(--genre-orange)';
      return 'var(--genre-default)'; // Цвет по умолчанию
  };

  // Логика выбора класса для цвета кооператива
  const getCoopColorClass = (coop: string) => {
      const lower = coop.toLowerCase();
      // Если есть хоть какой-то намек на мультиплеер — красим в один цвет
      if (lower.includes('online') || lower.includes('co-op') || lower.includes('multiplayer') || lower.includes('split') || lower.includes('lan')) {
          return 'coop-online'; 
      }
      // Иначе (Single) — другой цвет
      return 'coop-single';
  };

  const genreColor = getGenreColor(game.genre);
  const coopClass = getCoopColorClass(game.coop);

  return (
    <div className="game-card-inner" style={style}>
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
          {/* Бейдж жанра с динамическим цветом */}
          <span 
            className="badge genre" 
            style={{ backgroundColor: genreColor, borderColor: genreColor }}
          >
            {game.genre}
          </span>
          
          {/* Бейдж режима с классом цвета */}
          <span className={`badge coop ${coopClass}`}>
             {getCoopIcon(game.coop)} {game.normalizedCoop}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title" title={game.name}>{game.name}</h3>
        
        {/* Описание: выглядит как статика, но кликабельно */}
        <div 
            className="card-description-static"
            onClick={() => onOpenModal && onOpenModal(game)}
            title="Нажмите, чтобы открыть подробное описание"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onOpenModal && onOpenModal(game);
                }
            }}
        >
           {game.description || "Описание отсутствует..."}
        </div>

        <div className="card-tags">
          {game.subgenres.slice(0, 6).map((sub, i) => (
            <span key={i} className="tag subgenre-tag">{sub}</span>
          ))}
          {game.subgenres.length > 6 && (
            <span className="tag more-tag">+{game.subgenres.length - 6}</span>
          )}
        </div>

        <a 
          href={game.steam_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="steam-button"
          onClick={(e) => e.stopPropagation()} // Клик по Steam не открывает модалку
        >
          <Gamepad2 size={18} className="steam-icon"/>
          <span>В Steam</span>
        </a>
      </div>
    </div>
  );
});

export default GameCard;
