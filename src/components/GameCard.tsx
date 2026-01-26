import React, { memo } from 'react';
import { 
  Gamepad2, Users, Globe, Monitor, User, 
  Sword, Scroll, Brain, Hammer, Ghost,   // <--- Hammer вместо Pickaxe
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
  
  // --- ЛОГИКА КООП-РЕЖИМОВ ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    
    if (lower.includes('single')) {
      return { color: '#64748b', icon: <User size={11} />, label: 'Single' };
    }
    if (lower.includes('split') || lower.includes('shared') || lower.includes('local')) {
      return { color: '#d97706', icon: <Monitor size={11} />, label: 'Split Screen' };
    }
    if (lower.includes('online') || lower.includes('mmo') || lower.includes('multi')) {
      return { color: '#7c3aed', icon: <Globe size={11} />, label: 'Multiplayer' };
    }
    return { color: '#059669', icon: <Users size={11} />, label: 'Co-op' };
  };

  // --- ЛОГИКА ЖАНРОВ ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();

    // 1. Action
    if (g.includes('action') || g.includes('shooter') || g.includes('hack') || g.includes('fighting')) {
      return { color: '#ef4444', icon: <Sword size={11} /> };
    }
    // 2. RPG
    if (g.includes('rpg') || g.includes('role') || g.includes('adventure')) {
      return { color: '#10b981', icon: <Scroll size={11} /> };
    }
    // 3. Strategy
    if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('turn')) {
      return { color: '#3b82f6', icon: <Brain size={11} /> };
    }
    // 4. Simulation / Craft (Hammer вместо Pickaxe)
    if (g.includes('sim') || g.includes('build') || g.includes('craft') || g.includes('sandbox') || g.includes('farm')) {
      return { color: '#eab308', icon: <Hammer size={11} /> }; 
    }
    // 5. Horror
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) {
      return { color: '#be123c', icon: <Ghost size={11} /> };
    }
    // 6. Sports
    if (g.includes('sport')) {
      return { color: '#8b5cf6', icon: <Trophy size={11} /> };
    }
    // 7. Racing
    if (g.includes('racing') || g.includes('drive') || g.includes('automotive')) {
      return { color: '#f97316', icon: <Car size={11} /> };
    }
    // 8. Sci-Fi
    if (g.includes('space') || g.includes('sci-fi') || g.includes('cyberpunk')) {
      return { color: '#6366f1', icon: <Rocket size={11} /> };
    }
    // 9. Puzzle
    if (g.includes('puzzle') || g.includes('logic')) {
      return { color: '#ec4899', icon: <Puzzle size={11} /> };
    }
    // 10. Casual
    if (g.includes('casual') || g.includes('indie') || g.includes('visual novel')) {
      return { color: '#06b6d4', icon: <Coffee size={11} /> };
    }

    return { color: '#475569', icon: <Gamepad2 size={11} /> };
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
              {genreInfo.icon}
              <span style={{ marginLeft: 4 }}>{game.genre}</span>
            </span>
            
            <span className="badge" style={{ backgroundColor: coopInfo.color, borderColor: coopInfo.color }}>
              {coopInfo.icon}
              <span style={{ marginLeft: 4 }}>{coopInfo.label}</span>
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
