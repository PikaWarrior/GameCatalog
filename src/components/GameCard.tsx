import React, { memo } from 'react';
import { Gamepad2, Users, Globe, Monitor, User } from 'lucide-react';
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
    if (lower.includes('online')) return <Globe size={12} />;
    if (lower.includes('lan')) return <Monitor size={12} />;
    if (lower.includes('split') || lower.includes('shared')) return <Users size={12} />;
    return <User size={12} />;
  };

  const getGenreColor = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack')) return 'var(--genre-red)';
    if (g.includes('adventure') || g.includes('rpg') || g.includes('role') || g.includes('metroidvania')) return 'var(--genre-green)';
    if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('turn')) return 'var(--genre-blue)';
    if (g.includes('sim') || g.includes('sandbox') || g.includes('build') || g.includes('craft')) return 'var(--genre-yellow)';
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) return 'var(--genre-orange)';
    if (g.includes('sport') || g.includes('racing')) return 'var(--genre-purple)';
    return 'var(--genre-default)';
  };

  const genreColor = getGenreColor(game.genre);
  const coopClass = (game.normalizedCoop === 'Single') ? 'single' : 'multi';

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
              {getCoopIcon(game.coop)} 
              <span style={{marginLeft: 4}}>{game.normalizedCoop}</span>
            </span>
          </div>
        </div>

        {/* Контент */}
        <div className="card-content">
          <div className="card-header-row">
            <h3 className="card-title" title={game.name}>
              {game.name}
            </h3>
            <a 
              href={game.steam_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="steam-icon-link"
              onClick={(e) => e.stopPropagation()}
              title="Open in Steam"
            >
              <Gamepad2 size={18} />
            </a>
          </div>

          {/* ПОХОЖИЕ ИГРЫ (Крупные превью) */}
          <div className="card-similar-section">
            <div className="similar-label">Similar Games:</div>
            
            {game.similar_games && game.similar_games.length > 0 ? (
              <div className="card-similar-grid">
                {game.similar_games.slice(0, 3).map((sim, i) => (
                  <a 
                    key={sim.id || i}
                    href={sim.url}
                    target="_blank"
                    rel="noreferrer"
                    className="card-similar-item"
                    title={sim.name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={sim.image} alt={sim.name} loading="lazy" />
                  </a>
                ))}
                {game.similar_games.length > 3 && (
                  <div className="card-similar-more">
                    +{game.similar_games.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-similar">No similar games</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default GameCard;
