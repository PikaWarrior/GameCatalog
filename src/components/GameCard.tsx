import React, { memo } from 'react';
import { Gamepad2, ArrowRightLeft } from 'lucide-react';
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

  const getGenreColor = (genre: string) => {
    const g = genre.toLowerCase();
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting')) return 'var(--genre-red)';
    if (g.includes('adventure') || g.includes('rpg') || g.includes('role')) return 'var(--genre-green)';
    if (g.includes('strategy') || g.includes('sim') || g.includes('card')) return 'var(--genre-blue)';
    if (g.includes('horror') || g.includes('survival')) return 'var(--genre-orange)';
    if (g.includes('sport') || g.includes('racing')) return 'var(--genre-yellow)';
    return 'var(--genre-default)';
  };

  const genreColor = getGenreColor(game.genre);
  const coopClass = game.normalizedCoop === 'Single' ? 'single' : 'multi';

  return (
    <div 
      style={style} 
      className="game-card-wrapper"
      onClick={() => onOpenModal?.(game)}
    >
      <div className="game-card-inner">
        
        {/* Картинка */}
        <div className="game-card-image">
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-game.jpg'; }}
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
          
          <div className="card-description-static">
            {game.description ? game.description.replace(/<[^>]*>?/gm, '') : "No description"}
          </div>
          
          {/* --- ИЗМЕНЕНИЕ: ВЫВОД SIMILAR GAMES ВМЕСТО SUBGENRES --- */}
          <div className="card-tags">
             {/* Добавляем иконку, чтобы было понятно, что это */}
            <span className="tag-label" style={{ opacity: 0.5, fontSize: '0.7rem', marginRight: 4, display: 'flex', alignItems: 'center' }}>
               <ArrowRightLeft size={10} style={{marginRight:2}}/> Sim:
            </span>
            
            {game.similar_games && game.similar_games.length > 0 ? (
              game.similar_games.slice(0, 3).map((sim, i) => (
                <span key={i} className="tag subgenre-tag" title={sim.name}>
                  {sim.name}
                </span>
              ))
            ) : (
              <span className="tag" style={{ opacity: 0.3 }}>None</span>
            )}
            
            {game.similar_games && game.similar_games.length > 3 && (
              <span className="tag more-tag">+{game.similar_games.length - 3}</span>
            )}
          </div>
          
          <a 
            href={game.steam_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="steam-button"
            onClick={(e) => e.stopPropagation()}
          >
            <Gamepad2 size={18} />
            Steam
          </a>
        </div>

      </div>
    </div>
  );
});

export default GameCard;
