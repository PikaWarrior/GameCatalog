import React, { useEffect, useRef } from 'react';
import { 
  X, Star, Play, FileText, Tag, 
  Gamepad2, Users, Globe, Monitor, User,
  Sword, Scroll, Brain, Hammer, Ghost,
  Trophy, Car, Rocket, Puzzle, Coffee,
  Skull, Crosshair, Map, Dna, Music
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null; 
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const ICON_SIZE = 16;
  const ICON_STROKE = 2.5;

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

  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    if (lower.includes('single')) return { color: '#64748b', icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE}/>, label: 'Single' };
    if (lower.includes('split') || lower.includes('shared')) return { color: '#ea580c', icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE}/>, label: 'Split Screen' };
    if (lower.includes('online') || lower.includes('multi')) return { color: '#7c3aed', icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE}/>, label: 'Multiplayer' };
    return { color: '#059669', icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE}/>, label: 'Co-op' };
  };

  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action') || g.includes('hack') || g.includes('fighting')) return { color: '#dc2626', icon: <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('shooter') || g.includes('fps')) return { color: '#b91c1c', icon: <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('adventure') || g.includes('quest')) return { color: '#059669', icon: <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('rpg')) return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('rogue') || g.includes('dungeon')) return { color: '#d97706', icon: <Skull size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('metroidvania') || g.includes('platformer')) return { color: '#db2777', icon: <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('strategy') || g.includes('card')) return { color: '#2563eb', icon: <Brain size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('sim') || g.includes('craft')) return { color: '#d97706', icon: <Hammer size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('horror')) return { color: '#9f1239', icon: <Ghost size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('sport')) return { color: '#7c3aed', icon: <Trophy size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('racing')) return { color: '#ea580c', icon: <Car size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('space') || g.includes('sci-fi')) return { color: '#4f46e5', icon: <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('puzzle')) return { color: '#c026d3', icon: <Puzzle size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('music')) return { color: '#65a30d', icon: <Music size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('casual') || g.includes('indie')) return { color: '#0891b2', icon: <Coffee size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
  };

  const { name, image, genre, rating, subgenres, tags, similar_games_summary } = game;
  const genreInfo = getGenreDetails(genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close"> <X size={20} /> </button>

        {/* HERO SECTION */}
        <div className="modal-hero">
          {/* СЛОЙ 1: ФОНОВАЯ КАРТИНКА (ТЕПЕРЬ IMG) */}
          <img src={image} alt="" className="hero-backdrop-img" />
          
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
            {/* СЛОЙ 2: ПОСТЕР (СЛЕВА) */}
            <img src={image} alt={name} className="hero-poster" />
            
            <div className="hero-info">
              <h2 className="game-title">{name}</h2>
              <div className="meta-row">
                <span className="meta-badge" style={{ backgroundColor: `${genreInfo.color}40`, color: '#f1f5f9', borderColor: genreInfo.color }}>
                  <span style={{marginRight:6, display:'flex'}}>{genreInfo.icon}</span> {genre}
                </span>
                <span className="meta-badge" style={{ backgroundColor: `${coopInfo.color}40`, color: '#f1f5f9', borderColor: coopInfo.color }}>
                   <span style={{marginRight:6, display:'flex'}}>{coopInfo.icon}</span> {coopInfo.label}
                </span>
                {rating && ( <span className="meta-badge rating-badge"> <Star size={16} fill="currentColor" /> {rating} </span> )}
              </div>
              <div className="action-buttons">
                <a href={game.steam_url} target="_blank" rel="noreferrer" className="btn-primary"> <Play size={16} fill="currentColor" /> Open Steam </a>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-body custom-scrollbar" ref={modalRef}>
          <div className="modal-columns">
            <div className="main-column">
              <div className="modal-section">
                <h3>About</h3>
                <div className="description-text" dangerouslySetInnerHTML={{ __html: game.sanitizedDescription || game.description }} />
              </div>
              <div className="modal-section">
                <h3>Tags & Subgenres</h3>
                <div className="tags-cloud">
                  {subgenres.map((sg, i) => <span key={`sub-${i}`} className="tag-pill subgenre">{sg}</span>)}
                  {tags.map((tag, i) => <span key={`tag-${i}`} className="tag-pill"><Tag size={12} style={{marginRight:4}} /> {tag}</span>)}
                </div>
              </div>
            </div>
            <div className="side-column">
              {similar_games_summary && similar_games_summary.length > 0 && (
                <div className="modal-section">
                  <h3><FileText size={16} style={{ marginRight: 8 }}/> Similar Games</h3>
                  <div className="summary-list">
                    {similar_games_summary.map((text, i) => <div key={i} className="summary-item">{text}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GameModal;                  </span>
                )}
              </div>

              <div className="action-buttons">
                <a href={game.steam_url} target="_blank" rel="noreferrer" className="btn-primary">
                  <Play size={16} fill="currentColor" /> Open Steam
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-body custom-scrollbar" ref={modalRef}>
          <div className="modal-columns">
            <div className="main-column">
              <div className="modal-section">
                <h3>About</h3>
                <div className="description-text" dangerouslySetInnerHTML={{ __html: game.sanitizedDescription || game.description }} />
              </div>

              <div className="modal-section">
                <h3>Tags & Subgenres</h3>
                <div className="tags-cloud">
                  {subgenres.map((sg, i) => <span key={`sub-${i}`} className="tag-pill subgenre">{sg}</span>)}
                  {tags.map((tag, i) => <span key={`tag-${i}`} className="tag-pill"><Tag size={12} style={{marginRight:4}} /> {tag}</span>)}
                </div>
              </div>
            </div>

            <div className="side-column">
              {similar_games_summary && similar_games_summary.length > 0 && (
                <div className="modal-section">
                  <h3><FileText size={16} style={{ marginRight: 8 }}/> Similar Games</h3>
                  <div className="summary-list">
                    {similar_games_summary.map((text, i) => <div key={i} className="summary-item">{text}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
