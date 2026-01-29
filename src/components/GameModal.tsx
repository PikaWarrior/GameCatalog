import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Star, Play, FileText, Tag, 
  Gamepad2, Users, Globe, Monitor, User,
  Sword, Scroll, Brain, Hammer, Ghost, 
  Trophy, Car, Rocket, Puzzle, Coffee,
  Skull, Crosshair, Map, Dna, Music,
  Heart, Link as LinkIcon, Check // Добавлены LinkIcon и Check
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ 
  game, 
  onClose, 
  isFavorite = false, 
  onToggleFavorite 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const ICON_SIZE = 16;
  const ICON_STROKE = 2.5;

  if (!game) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;
    setCopySuccess(false); // Сброс статуса копирования при открытии новой игры
  }, [game.id]);

  // --- ЛОГИКА КОПИРОВАНИЯ ССЫЛКИ ---
  const handleCopyLink = () => {
    // Формируем ссылку вручную, чтобы убедиться, что она правильная
    const url = `${window.location.origin}${window.location.pathname}#game=${encodeURIComponent(game.name)}`;
    navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // --- КООП ЛОГИКА ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    if (lower.includes('single')) return { color: '#64748b', icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Single' };
    if (lower.includes('split') || lower.includes('shared')) return { color: '#ea580c', icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Split Screen' };
    if (lower.includes('online') || lower.includes('multi')) return { color: '#7c3aed', icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Multiplayer' };
    return { color: '#059669', icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Co-op' };
  };

  // --- ЖАНР ЛОГИКА ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action') || g.includes('hack') || g.includes('fighting')) return { color: '#dc2626', icon: <Sword size={ICON_SIZE} /> };
    if (g.includes('shooter') || g.includes('fps')) return { color: '#b91c1c', icon: <Crosshair size={ICON_SIZE} /> };
    if (g.includes('adventure')) return { color: '#059669', icon: <Map size={ICON_SIZE} /> };
    if (g.includes('rpg')) return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} /> };
    if (g.includes('rogue') || g.includes('dungeon')) return { color: '#d97706', icon: <Ghost size={ICON_SIZE} /> };
    if (g.includes('metroidvania') || g.includes('platformer')) return { color: '#db2777', icon: <Trophy size={ICON_SIZE} /> };
    if (g.includes('strategy') || g.includes('card')) return { color: '#2563eb', icon: <Brain size={ICON_SIZE} /> };
    if (g.includes('sim') || g.includes('craft')) return { color: '#d97706', icon: <Hammer size={ICON_SIZE} /> };
    if (g.includes('horror')) return { color: '#9f1239', icon: <Skull size={ICON_SIZE} /> };
    if (g.includes('sport')) return { color: '#7c3aed', icon: <Trophy size={ICON_SIZE} /> };
    if (g.includes('racing')) return { color: '#ea580c', icon: <Car size={ICON_SIZE} /> };
    if (g.includes('space') || g.includes('sci-fi')) return { color: '#4f46e5', icon: <Rocket size={ICON_SIZE} /> };
    if (g.includes('puzzle')) return { color: '#c026d3', icon: <Puzzle size={ICON_SIZE} /> };
    if (g.includes('music')) return { color: '#65a30d', icon: <Music size={ICON_SIZE} /> };
    if (g.includes('casual') || g.includes('indie')) return { color: '#0891b2', icon: <Coffee size={ICON_SIZE} /> };
    return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} /> };
  };

  const { name, image, genre, rating, subgenres, tags, similar_games_summary } = game;
  const genreInfo = getGenreDetails(genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);

  // Парсинг похожих игр
  let similarGamesList = [];
  try {
      if (typeof game.similar_games === 'string') {
          similarGamesList = JSON.parse(game.similar_games);
      } else if (Array.isArray(game.similar_games)) {
          similarGamesList = game.similar_games;
      }
  } catch (e) {
      similarGamesList = [];
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        
        {/* HERO SECTION */}
        <div className="modal-hero">
          <img src={image} alt={name} className="hero-image" />
          <div className="hero-overlay"></div>
          <div className="hero-content">
             <h2 className="game-title">{name}</h2>
             <div className="hero-badges">
                <span className="hero-badge" style={{ backgroundColor: genreInfo.color }}>
                   {genreInfo.icon} {genre}
                </span>
                <span className="hero-badge" style={{ backgroundColor: coopInfo.color }}>
                   {coopInfo.icon} {coopInfo.label}
                </span>
                {rating && (
                  <span className="hero-badge rating-badge">
                    <Star size={14} fill="currentColor" /> {rating}
                  </span>
                )}
             </div>
          </div>
          
          <div className="modal-controls">
             {/* НОВАЯ КНОПКА SHARE */}
             <button 
               className={`control-btn ${copySuccess ? 'success' : ''}`}
               onClick={handleCopyLink}
               title="Copy Link"
             >
                {copySuccess ? <Check size={20} /> : <LinkIcon size={20} />}
             </button>

             <a href={game.steam_url} target="_blank" rel="noopener noreferrer" className="control-btn steam" title="Open on Steam">
                <Play size={20} fill="currentColor" /> Open Steam
             </a>
             <button className="control-btn close" onClick={onClose}>
                <X size={24} />
             </button>
          </div>
        </div>

        <div className="modal-body">
           <div className="modal-main-col">
              {/* КНОПКА ИЗБРАННОГО */}
              {onToggleFavorite && (
                 <button 
                   className={`modal-fav-btn ${isFavorite ? 'active' : ''}`}
                   onClick={onToggleFavorite}
                 >
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                 </button>
              )}

              <div className="info-section">
                 <h3><FileText size={18} /> About</h3>
                 <p className="description-text">{game.sanitizedDescription || game.description}</p>
              </div>

              <div className="info-section">
                 <h3><Tag size={18} /> Tags & Subgenres</h3>
                 <div className="tags-cloud-modal">
                    {subgenres.map((sg) => (
                       <span key={sg} className="modal-tag subgenre">{sg}</span>
                    ))}
                    {tags.map((tag) => (
                       <span key={tag} className="modal-tag">{tag}</span>
                    ))}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN: Similar Games */}
           <div className="modal-side-col">
              {game.similar_games_summary && (
                  <div className="info-section summary-section">
                      <h3><Brain size={18} /> Why play this?</h3>
                      <p>{game.similar_games_summary}</p>
                  </div>
              )}

              {similarGamesList.length > 0 && (
                <div className="info-section">
                   <h3><Gamepad2 size={18} /> Similar Games</h3>
                   <div className="similar-games-list">
                      {similarGamesList.map((simGame: any, i: number) => (
                         <a key={i} href={simGame.url} target="_blank" rel="noopener noreferrer" className="similar-game-item">
                            <img src={simGame.image} alt={simGame.name} />
                            <span>{simGame.name}</span>
                         </a>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
