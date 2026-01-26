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
    const lower = (coop || '').toLowerCase();
    if (lower.includes('online')) return <Globe size={12} />;
    if (lower.includes('lan')) return <Monitor size={12} />;
    if (lower.includes('split') || lower.includes('shared') || lower.includes('local')) return <Users size={12} />;
    return <User size={12} />;
  };

  // 2. ЦВЕТА ЖАНРОВ (Расширенная палитра)
  const getGenreColor = (genre: string) => {
    const g = (genre || '').toLowerCase();
    
    // Красные (Экшен)
    if (g.includes('action') || g.includes('shooter') || g.includes('fighting') || g.includes('hack') || g.includes('fps')) return '#ef4444'; 
    // Зеленые (Приключения/РПГ)
    if (g.includes('adventure') || g.includes('rpg') || g.includes('role') || g.includes('metroidvania')) return '#10b981'; 
    // Синие (Стратегии)
    if (g.includes('strategy') || g.includes('rts') || g.includes('card') || g.includes('turn') || g.includes('tactical')) return '#3b82f6'; 
    // Желтые (Симуляторы)
    if (g.includes('sim') || g.includes('build') || g.includes('craft') || g.includes('sandbox') || g.includes('manage')) return '#f59e0b'; 
    // Оранжевые (Хоррор/Выживание)
    if (g.includes('horror') || g.includes('survival') || g.includes('zombie')) return '#f97316'; 
    // Фиолетовые (Спорт/Гонки)
    if (g.includes('sport') || g.includes('racing') || g.includes('driving')) return '#8b5cf6'; 
    // Розовые (Инди/Казуальные/Аркады)
    if (g.includes('indie') || g.includes('casual') || g.includes('arcade') || g.includes('puzzle') || g.includes('platformer')) return '#ec4899';
    
    // Дефолтный (Серый)
    return '#64748b'; 
  };

  const getCoopColor = (coop: string) => {
    // Single -> Темно-серый, Всё остальное -> Изумрудный
    return (coop === 'Single') ? '#475569' : '#059669';
  };

  const genreColor = getGenreColor(game.genre);
  const coopColor = getCoopColor(game.normalizedCoop);
  
  // Очистка описания
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
            {/* ЖАНР: Цвет передается инлайн, перекрывая CSS */}
            <span className="badge" style={{ backgroundColor: genreColor, borderColor: genreColor }}>
              {game.genre}
            </span>
            
            {/* КООП: Цвет передается инлайн */}
            <span className="badge" style={{ backgroundColor: coopColor, borderColor: coopColor }}>
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

          {/* ОПИСАНИЕ */}
          <div className="card-description-static">
            {cleanDesc}
          </div>

          {/* ПОХОЖИЕ ИГРЫ (Увеличенные) */}
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
