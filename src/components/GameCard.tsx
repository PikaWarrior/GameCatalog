import React, { memo } from 'react';
import { 
  Gamepad2, Users, Globe, Monitor, User, 
  Sword, Scroll, Brain, Hammer, Ghost, 
  Trophy, Car, Rocket, Puzzle, Coffee 
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onOpenModal?: (game: ProcessedGame) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style, onOpenModal }) => {
  
  // Увеличиваем размер иконок и толщину линий для четкости
  const ICON_SIZE = 14;
  const ICON_STROKE = 2;

  // --- ЛОГИКА КООП-РЕЖИМОВ ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    
    if (lower.includes('single')) {
      return { color: '#64748b', icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Single' };
    }
    if (lower.includes('split') || lower.includes('shared') || lower.includes('local')) {
      return { color: '#d97706', icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Split Screen' };
    }
    if (lower.includes('online') || lower.includes('mmo') || lower.includes('multi')) {
      return { color: '#7c3aed', icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Multiplayer' };
    }
    return { color: '#059669', icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Co-op' };
  };

  // --- ЛОГИКА ЖАНРОВ ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();

    // 1. Action
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack')) {
      return { color: '#ef4444', icon: <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 2. RPG
    if (g.includes('rpg') || g.includes('role') || g.includes('adventure')) {
      return { color: '#10b981', icon: <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 3. Strategy
    if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('turn')) {
      return { color: '#3b82f6', icon: <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 4. Simulation / Craft
    if (g.includes('sim') || g.includes('build') || g.includes('craft') || g.includes('sandbox')) {
      return { color: '#eab308', icon: <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} /> }; 
    }
    // 5. Horror
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) {
      return { color: '#be123c', icon: <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 6. Sports
    if (g.includes('sport')) {
      return { color: '#8b5cf6', icon: <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 7. Racing
    if (g.includes('racing') || g.includes('drive')) {
      return { color: '#f97316', icon: <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 8. Sci-Fi
    if (g.includes('space') || g.includes('sci-fi') || g.includes('cyberpunk')) {
      return { color: '#6366f1', icon: <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 9. Puzzle
    if (g.includes('puzzle') || g.includes('logic')) {
      return { color: '#ec4899', icon: <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }
    // 10. Casual / Indie
    if (g.includes('casual') || g.includes('indie')) {
      return { color: '#06b6d4', icon: <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    }

    return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  };

  const genreInfo = getGenreDetails(game.genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);
  const cleanDesc = (game.description || "No description").replace(/<[^>]*>?/gm, '');

  return (
    <div 
      style={style} 
      className="game-card-wrapper"
      onClick={() => onOpenModal?.(game)}
    >
      <div className="game-card-inner">
        
        {/* КАРТИНКА */}
        <div className="game-card-image">
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-game.jpg'; }}
          />
          
          <div className="card-badges">
            <span className="badge" style={{ backgroundColor: genreInfo.color, borderColor: genreInfo.color }}>
              <span className="badge-icon">{genreInfo.icon}</span>
              <span>{game.genre}</span>
            </span>
            
            <span className="badge" style={{ backgroundColor: coopInfo.color, borderColor: coopInfo.color }}>
              <span className="badge-icon">{coopInfo.icon}</span>
              <span>{coopInfo.label}</span>
            </span>
          </div>
        </div>

        {/* КОНТЕНТ */}
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

          <div className="card-description-static">
            {cleanDesc}
          </div>

          {/* ПОХОЖИЕ ИГРЫ */}
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
