import React, { useEffect } from 'react';
import { X, Star, Download, Play, Tag, Users } from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null; 
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
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

  const title = game.name;
  const coverUrl = game.image; 
  const backdropUrl = coverUrl; 
  
  const tags = game.tags || [];
  const subgenres = game.subgenres || [];

  // Пытаемся безопасно получить рейтинг, если он вдруг появится в типах как optional
  // @ts-ignore - игнорируем ошибку TS, если поля нет в типе, но оно есть в данных
  const rating = game.rating;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div 
          className="modal-hero" 
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <img src={coverUrl} alt={title} className="hero-poster" />
            <div className="hero-info">
              <h2 className="game-title">{title}</h2>
              
              <div className="meta-row">
                <span className="meta-badge">
                  <Tag size={14} /> {game.genre}
                </span>
                
                <span className="meta-badge">
                   <Users size={14} /> {game.coop}
                </span>

                {/* БЕЗОПАСНЫЙ РЕНДЕР РЕЙТИНГА */}
                {/* Рендерим только если rating существует */}
                {rating && (
                  <span className="meta-badge rating-badge">
                    <Star size={14} fill="currentColor" /> {rating}
                  </span>
                )}
              </div>

              <div className="action-buttons">
                <button className="btn-primary">
                  <Play size={18} fill="currentColor" /> Play Now
                </button>
                <button className="btn-secondary">
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-body custom-scrollbar">
          
          <div className="modal-section">
            <h3>About</h3>
            <p className="description-text">
              {game.sanitizedDescription || game.description}
            </p>
          </div>

          <div className="modal-section">
            <h3>Tags & Genres</h3>
            <div className="tags-cloud">
              {subgenres.map(sg => (
                <span key={sg} className="tag-pill subgenre">{sg}</span>
              ))}
              {tags.map(tag => (
                <span key={tag} className="tag-pill">
                   <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameModal;
