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
  
  // 1. ИКОНКИ КООПА
  const getCoopIcon = (coop: string) => {
    const lower = coop.toLowerCase();
    if (lower.includes('online')) return <Globe size={12} />;
    if (lower.includes('lan')) return <Monitor size={12} />;
    if (lower.includes('split') || lower.includes('shared')) return <Users size={12} />;
    return <User size={12} />;
  };

  // 2. ЦВЕТА (Прямо в коде, чтобы не ломались)
  const getGenreColor = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting')) return '#ef4444'; // Red
    if (g.includes('adventure') || g.includes('rpg') || g.includes('role')) return '#10b981'; // Green
    if (g.includes('strategy') || g.includes('rts') || g.includes('card')) return '#3b82f6'; // Blue
    if (g.includes('sim') || g.includes('build') || g.includes('craft')) return '#f59e0b'; // Yellow
    if (g.includes('horror') || g.includes('survival')) return '#f97316'; // Orange
    if (g.includes('sport') || g.includes('racing')) return '#8b5cf6'; // Purple
    return '#64748b'; // Default Slate
  };

  const getCoopColor = (coop: string) => {
    return coop === 'Single' ? '#475569' : '#059669'; // Серый или Изумрудный
  };

  const genreColor = getGenreColor(game.genre);
  const coopColor = getCoopColor(game.normalizedCoop);
  
  // Очистка описания от HTML тегов для превью
  const cleanDesc = (game.description || "No description").replace(/<[^>]*>?/gm, '');

  return (
    <div 
      style={style} 
      className="game-card-wrapper"
      onClick={() => onOpenModal?.(game)}
    >
      <div className="game-card-inner">
        
        {/* --- КАРТИНКА --- */}
        <div className="game-card-image">
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-game.jpg'; }}
          />
          
          <div className="card-badges">
            <span className="badge" style={{ backgroundColor: genreColor }}>
              {game.genre}
            </span>
            <span className="badge" style={{ backgroundColor: coopColor }}>
              {getCoopIcon(game.coop)} 
              <span style={{marginLeft: 4}}>{game.normalizedCoop}</span>
            </span>
          </div>
        </div>

        {/* --- КОНТЕНТ --- */ }
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

          {/* --- ВОЗВРАЩЕННОЕ ОПИСАНИЕ --- */}
          <div className="card-description-static">
            {cleanDesc}
          </div>

          {/* --- ПОХОЖИЕ ИГРЫ --- */}
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
              </div>
            ) : (
              <div className="no-similar">No similar games found</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default GameCard;
