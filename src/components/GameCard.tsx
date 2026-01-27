import React, { memo } from 'react';
import { 
  Gamepad2, Users, Globe, Monitor, User, 
  Sword, Scroll, Brain, Hammer, Ghost, 
  Trophy, Car, Rocket, Puzzle, Coffee,
  Skull, Crosshair, Map, Dna, Music
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameCard.css';

interface GameCardProps {
  game: ProcessedGame;
  style?: React.CSSProperties;
  onOpenModal?: (game: ProcessedGame) => void;
}

const GameCard: React.FC<GameCardProps> = memo(({ game, style, onOpenModal }) => {
  
  const ICON_SIZE = 16;
  const ICON_STROKE = 2;

  // --- ЛОГИКА КООП-РЕЖИМОВ ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    
    if (lower.includes('single')) {
      return { 
        style: { backgroundColor: '#64748b', borderColor: 'rgba(255,255,255,0.2)' },
        icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Single' 
      };
    }
    if (lower.includes('split') || lower.includes('shared') || lower.includes('local')) {
      return { 
        style: { backgroundColor: '#ea580c', borderColor: '#fb923c' },
        icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Split Screen' 
      };
    }
    if (lower.includes('online') || lower.includes('mmo') || lower.includes('multi')) {
      return { 
        style: { backgroundColor: '#7c3aed', borderColor: '#a78bfa' },
        icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Multiplayer' 
      };
    }
    return { 
      style: { backgroundColor: '#059669', borderColor: '#34d399' },
      icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
      label: 'Co-op' 
    };
  };

  // --- ЛОГИКА ЖАНРОВ ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    let color = '#475569';
    let icon = <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />;

    if (g.includes('action') || g.includes('hack') || g.includes('fighting') || g.includes('beat')) { color = '#dc2626'; icon = <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('shooter') || g.includes('fps') || g.includes('tps') || g.includes('gun')) { color = '#b91c1c'; icon = <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('adventure') || g.includes('quest')) { color = '#059669'; icon = <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('rpg') || g.includes('role')) { color = '#16a34a'; icon = <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('rogue') || g.includes('dungeon') || g.includes('souls')) { color = '#d97706'; icon = <Skull size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('metroidvania') || g.includes('platformer')) { color = '#db2777'; icon = <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('tactical')) { color = '#2563eb'; icon = <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('sim') || g.includes('build') || g.includes('craft') || g.includes('sandbox') || g.includes('farm')) { color = '#d97706'; icon = <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) { color = '#9f1239'; icon = <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('sport')) { color = '#7c3aed'; icon = <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('racing') || g.includes('drive')) { color = '#ea580c'; icon = <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('space') || g.includes('sci-fi') || g.includes('cyberpunk')) { color = '#4f46e5'; icon = <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('puzzle') || g.includes('logic')) { color = '#c026d3'; icon = <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('music') || g.includes('rhythm')) { color = '#65a30d'; icon = <Music size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('casual') || g.includes('indie') || g.includes('novel')) { color = '#0891b2'; icon = <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }

    return { 
      style: { backgroundColor: color, borderColor: 'rgba(255,255,255,0.3)' }, 
      icon 
    };
  };

  const genreInfo = getGenreDetails(game.genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);
  const cleanDesc = (game.description || "No description available.").replace(/<[^>]*>?/gm, '');

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
            <span className="badge" style={genreInfo.style}>
              <span className="badge-icon">{genreInfo.icon}</span>
              <span>{game.genre}</span>
            </span>
            <span className="badge" style={coopInfo.style}>
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
              <span className="badge-icon">{genreInfo.icon}</span>
              <span>{game.genre}</span>
            </span>
            <span className="badge" style={coopInfo.style}>
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
      return { 
        style: { backgroundColor: '#ea580c', borderColor: '#fb923c' },
        icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Split Screen' 
      };
    }
    if (lower.includes('online') || lower.includes('mmo') || lower.includes('multi')) {
      return { 
        style: { backgroundColor: '#7c3aed', borderColor: '#a78bfa' },
        icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
        label: 'Multiplayer' 
      };
    }
    return { 
      style: { backgroundColor: '#059669', borderColor: '#34d399' },
      icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, 
      label: 'Co-op' 
    };
  };

  // --- ЛОГИКА ЖАНРОВ ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    let color = '#475569';
    let icon = <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />;

    if (g.includes('action') || g.includes('hack') || g.includes('fighting') || g.includes('beat')) { color = '#dc2626'; icon = <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('shooter') || g.includes('fps') || g.includes('tps') || g.includes('gun')) { color = '#b91c1c'; icon = <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('adventure') || g.includes('quest')) { color = '#059669'; icon = <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('rpg') || g.includes('role')) { color = '#16a34a'; icon = <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('rogue') || g.includes('dungeon') || g.includes('souls')) { color = '#d97706'; icon = <Skull size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('metroidvania') || g.includes('platformer')) { color = '#db2777'; icon = <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('tactical')) { color = '#2563eb'; icon = <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('sim') || g.includes('build') || g.includes('craft') || g.includes('sandbox') || g.includes('farm')) { color = '#d97706'; icon = <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) { color = '#9f1239'; icon = <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('sport')) { color = '#7c3aed'; icon = <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('racing') || g.includes('drive')) { color = '#ea580c'; icon = <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('space') || g.includes('sci-fi') || g.includes('cyberpunk')) { color = '#4f46e5'; icon = <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('puzzle') || g.includes('logic')) { color = '#c026d3'; icon = <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('music') || g.includes('rhythm')) { color = '#65a30d'; icon = <Music size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }
    else if (g.includes('casual') || g.includes('indie') || g.includes('novel')) { color = '#0891b2'; icon = <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} />; }

    return { 
      style: { backgroundColor: color, borderColor: 'rgba(255,255,255,0.3)' }, 
      icon 
    };
  };

  const genreInfo = getGenreDetails(game.genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);
  // Защита от undefined и очистка тегов
  const cleanDesc = (game.description || "No description available.").replace(/<[^>]*>?/gm, '');

  // ПРОВЕРКА КАРТИНКИ (STEAM ИЛИ НЕТ)
  const isSteam = game.image?.includes('steamstatic');

  return (
    <div 
      style={style} 
      className="game-card-wrapper"
      onClick={() => onOpenModal?.(game)}
    >
      <div className="game-card-inner">
        
        {/* КАРТИНКА С УМНЫМ ФОНОМ */}
        <div 
          className={`game-card-image ${!isSteam ? 'dynamic-bg' : ''}`}
          // Если не Steam, добавляем картинку в inline-стиль для наследования в CSS ::before
          style={!isSteam ? { backgroundImage: `url('${game.image}')` } : {}}
        >
          <img 
            src={game.image} 
            alt={game.name} 
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-game.jpg'; }}
          />
          
          <div className="card-badges">
            <span className="badge" style={genreInfo.style}>
              <span className="badge-icon">{genreInfo.icon}</span>
              <span>{game.genre}</span>
            </span>
            <span className="badge" style={coopInfo.style}>
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
                {game.similar_games.slice(0, 3).map((sim, i) => {
                  // ВОТ ЗДЕСЬ БЫЛА ОШИБКА. 
                  // Используем фигурные скобки {}, чтобы объявить переменную
                  const isSimSteam = sim.image?.includes('steamstatic');
                  
                  // И явный return (...)
                  return (
                    <a 
                      key={sim.id || i}
                      href={sim.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`card-similar-item ${!isSimSteam ? 'dynamic-bg' : ''}`}
                      style={!isSimSteam ? { backgroundImage: `url('${sim.image}')` } : {}}
                      title={sim.name}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={sim.image} alt={sim.name} loading="lazy" />
                    </a>
                  );
                })}
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
