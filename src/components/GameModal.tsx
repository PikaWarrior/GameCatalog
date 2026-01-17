import React, { useEffect } from 'react';
import { X, Calendar, Star, Download, Play, Tag, Users } from 'lucide-react';
import { ProcessedGame } from '../types'; // Импортируем твои типы
import '../styles/GameModal.css';

interface GameModalProps {
  // Меняем тип с Game на ProcessedGame или any, чтобы принять твои данные
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

  // --- АДАПТАЦИЯ ДАННЫХ ---
  // Используем поля из твоего JSON (name, image, genre)
  const title = game.name;
  const coverUrl = game.image; // В твоих данных это 'image', а не 'coverUrl'
  // Если есть backdrop, используем его, иначе размытый кавер
  const backdropUrl = coverUrl; 
  
  // Безопасное получение массивов (если вдруг undefined)
  const tags = game.tags || [];
  const subgenres = game.subgenres || [];

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
                {/* Вместо года показываем жанр, если года нет в данных */}
                <span className="meta-badge">
                  <Tag size={14} /> {game.genre}
                </span>
                
                {/* Кооператив */}
                <span className="meta-badge">
                   <Users size={14} /> {game.coop}
                </span>

                {/* Если есть рейтинг */}
                {game.rating && (
                  <span className="meta-badge rating-badge">
                    <Star size={14} fill="currentColor" /> {game.rating}
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
            {/* description иногда называется sanitizedDescription в App.tsx */}
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
