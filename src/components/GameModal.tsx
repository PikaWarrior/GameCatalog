import React, { useEffect, useRef } from 'react';
import { X, Star, Play, Tag, Users, LayoutGrid } from 'lucide-react';
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
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [game.id]);

  const { name, image, genre, coop, rating } = game;
  
  // Дополнительная защита на уровне рендеринга
  const tags = Array.isArray(game.tags) ? game.tags : [];
  const subgenres = Array.isArray(game.subgenres) ? game.subgenres : [];
  const similarGames = Array.isArray(game.similar_games) ? game.similar_games : [];
  
  const description = game.sanitizedDescription || game.description || 'No description available.';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

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
                <span className="meta-badge">
                  <Tag size={14} /> {genre}
                </span>
                
                <span className="meta-badge">
                   <Users size={14} /> {coop}
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
                  style={{ textDecoration: 'none' }}
                >
                  <Play size={18} fill="currentColor" /> Play / Steam
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-body custom-scrollbar" ref={modalRef}>
          
          <div className="modal-section">
            <h3>About</h3>
            <div 
              className="description-text"
              dangerouslySetInnerHTML={{ __html: description }} 
            />
          </div>

          <div className="modal-section">
            <h3>Tags & Genres</h3>
            <div className="tags-cloud">
              {/* Принудительное приведение к строке String(sg) защищает от объектов */}
              {subgenres.map((sg, i) => (
                <span key={`sub-${i}`} className="tag-pill subgenre">{String(sg)}</span>
              ))}
              
              {tags.slice(0, 30).map((tag, i) => (
                <span key={`tag-${i}`} className="tag-pill">
                   <Tag size={12} /> {String(tag)}
                </span>
              ))}

              {subgenres.length === 0 && tags.length === 0 && (
                <span className="no-tags-msg" style={{color: '#64748b', fontSize: '0.9rem'}}>
                  No tags available
                </span>
              )}
            </div>
          </div>

          {similarGames.length > 0 && (
            <div className="modal-section">
              <h3>
                <LayoutGrid size={16} style={{display:'inline', marginRight: 8, verticalAlign: 'text-bottom'}}/>
                Similar Games
              </h3>
              <div className="similar-games-grid">
                {similarGames.slice(0, 6).map((sim) => (
                  <div key={sim.id} className="similar-game-card">
                    <div className="similar-image-wrap">
                      <img 
                        src={sim.image} 
                        alt={sim.name} 
                        loading="lazy" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-game.jpg'; }}
                      />
                    </div>
                    <span className="similar-name">{sim.name}</span>
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
