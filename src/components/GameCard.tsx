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

  // --- ОБНОВЛЕННАЯ ЛОГИКА ЦВЕТОВ ---
  const getGenreColor = (genre: string) => {
    const g = genre.toLowerCase();
    
    // Action / Fighting / Shooter -> Красный
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack') || g.includes('beat')) return 'var(--genre-red)';
    
    // Adventure / RPG / Metroidvania -> Зеленый
    if (g.includes('adventure') || g.includes('rpg') || g.includes('role') || g.includes('metroidvania')) return 'var(--genre-green)';
    
    // Strategy / Sim / Sandbox -> Синий
    if (g.includes('strategy') || g.includes('simulation') || g.includes('management') || g.includes('city') || g.includes('sandbox')) return 'var(--genre-blue)';
    
    // Horror / Survival -> Фиолетовый
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) return 'var(--genre-purple)';
    
    // Puzzle / Platformer -> Желтый
    if (g.includes('puzzle') || g.includes('platformer') || g.includes('arcade')) return 'var(--genre-yellow)';
    
    // Roguelike / Roguelite -> Оранжевый
    if (g.includes('rogue') || g.includes('lite') || g.includes('dungeon')) return 'var(--genre-orange)';
    
    // Fallback
    return 'var(--genre-default)';
  };

  // Логика выбора цвета для режима
  const getCoopColorClass = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online') || lower.includes('co-op') || lower.includes('multiplayer') || lower.includes('split') || lower.includes('lan')) {
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
      role="button"
      tabIndex={0}
      onClick={() => onOpenModal && onOpenModal(game)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenModal && onOpenModal(game);
        }
      }}
    >
      <div className="game-card-inner">
        
        {/* Картинка и Бейджи */}
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
            <span className="badge genre" style={{ backgroundColor: genreColor }}>
              {game.genre}
            </span>
            <span className={`badge coop ${coopClass}`}>
              {getCoopIcon(game.coop)} {game.normalizedCoop}
            </span>
          </div>
        </div>

        {/* Контент */}
        <div className="card-content">
          <h3 className="card-title" title={game.name}>
            {game.name}
          </h3>
          
          {/* Статичное описание */}
          <div className="card-description-static">
            {game.description || "Описание отсутствует..."}
          </div>
          
          {/* Теги */}
          <div className="card-tags">
            {game.subgenres.slice(0, 6).map((sub, i) => (
              <span key={i} className="tag subgenre-tag">
                {sub}
              </span>
            ))}
            {game.subgenres.length > 6 && (
              <span className="tag more-tag">
                +{game.subgenres.length - 6}
              </span>
            )}
          </div>
          
          {/* Кнопка Steam */}
          <a 
            href={game.steam_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="steam-button"
            onClick={(e) => e.stopPropagation()}
          >
            <Gamepad2 size={18} />
            В Steam
          </a>
        </div>

      </div>
    </div>
  );
});

export default GameCard;
