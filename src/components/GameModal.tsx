import React, { useEffect, useRef } from 'react';
import { X, Star, Play, Tag, Users, FileText, Gamepad2 } from 'lucide-react';
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
    // Блокировка скролла
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

  // Извлекаем нужные поля. Теперь нам важен similar_games_summary
  const { name, image, genre, coop, rating, subgenres, tags, similar_games_summary } = game;

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
                <span className="meta-badge">
                  <Gamepad2 size={14} /> {genre}
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
            <h3>Details</h3>
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

          {/* --- НОВАЯ СЕКЦИЯ: SUMMARY --- */}
          {/* Выводим только если есть summary */}
          {similar_games_summary && similar_games_summary.length > 0 && (
            <div className="modal-section">
              <h3>
                <FileText size={16} style={{ marginRight: 8 }}/>
                Why Similar?
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
