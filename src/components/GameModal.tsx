import React, { useEffect, useRef } from 'react';
import { 
  X, Star, Play, Tag, FileText, 
  Gamepad2, Users, Globe, Monitor, User,
  Sword, Scroll, Brain, Hammer, Ghost,  // <--- Hammer вместо Pickaxe
  Trophy, Car, Rocket, Puzzle, Coffee 
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null; 
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!game) return null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;
  }, [game.id]);

  // --- ЛОГИКА ЦВЕТОВ ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    if (lower.includes('single')) return { color: '#64748b', icon: <User size={14} />, label: 'Single' };
    if (lower.includes('split') || lower.includes('shared')) return { color: '#d97706', icon: <Monitor size={14} />, label: 'Split Screen' };
    if (lower.includes('online') || lower.includes('multi')) return { color: '#7c3aed', icon: <Globe size={14} />, label: 'Multiplayer' };
    return { color: '#059669', icon: <Users size={14} />, label: 'Co-op' };
  };

  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action') || g.includes('shooter')) return { color: '#ef4444', icon: <Sword size={14} /> };
    if (g.includes('rpg') || g.includes('adventure')) return { color: '#10b981', icon: <Scroll size={14} /> };
    if (g.includes('strategy') || g.includes('card')) return { color: '#3b82f6', icon: <Brain size={14} /> };
    if (g.includes('sim') || g.includes('craft')) return { color: '#eab308', icon: <Hammer size={14} /> }; // <--- Hammer
    if (g.includes('horror')) return { color: '#be123c', icon: <Ghost size={14} /> };
    if (g.includes('sport')) return { color: '#8b5cf6', icon: <Trophy size={14} /> };
    if (g.includes('racing')) return { color: '#f97316', icon: <Car size={14} /> };
    if (g.includes('indie') || g.includes('casual')) return { color: '#06b6d4', icon: <Coffee size={14} /> };
    return { color: '#475569', icon: <Gamepad2 size={14} /> };
  };

  const { name, image, genre, coop, rating, subgenres, tags, similar_games_summary } = game;
  const genreInfo = getGenreDetails(genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* HERO */}
        <div 
          className="modal-hero" 
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
            <img src={image} alt={name} className="hero-poster" />
            
            <div className="hero-info">
              <h2 className="game-title">{name}</h2>
              
              <div className="meta-row">
                <span 
                  className="meta-badge" 
                  style={{ backgroundColor: `${genreInfo.color}33`, color: '#e2e8f0', borderColor: genreInfo.color }}
                >
                  {genreInfo.icon} {genre}
                </span>

                <span 
                  className="meta-badge"
                  style={{ backgroundColor: `${coopInfo.color}33`, color: '#e2e8f0', borderColor: coopInfo.color }}
                >
                   {coopInfo.icon} {coopInfo.label}
                </span>

                {rating && (
                  <span className="meta-badge rating-badge">
                    <Star size={14} fill="currentColor" /> {rating}
                  </span>
                )}
              </div>

              <div className="action-buttons">
                <a 
                  href={game.steam_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <Play size={16} fill="currentColor" /> Open Steam
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="modal-body custom-scrollbar" ref={modalRef}>
          
          <div className="modal-section">
            <h3>About</h3>
            <div 
              className="description-text"
              dangerouslySetInnerHTML={{ __html: game.sanitizedDescription || game.description }} 
            />
          </div>

          <div className="modal-section">
            <h3>Tags & Subgenres</h3>
            <div className="tags-cloud">
              {subgenres.map((sg, i) => (
                <span key={`sub-${i}`} className="tag-pill subgenre">{sg}</span>
              ))}
              {tags.map((tag, i) => (
                <span key={`tag-${i}`} className="tag-pill">
                   <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          </div>

          {similar_games_summary && similar_games_summary.length > 0 && (
            <div className="modal-section">
              <h3>
                <FileText size={16} style={{ marginRight: 8 }}/>
                Similar Games
              </h3>
              <div className="summary-list">
                {similar_games_summary.map((text, i) => (
                  <div key={i} className="summary-item">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GameModal;
