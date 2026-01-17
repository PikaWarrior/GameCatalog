import React, { useEffect } from 'react';
import { X, Calendar, Star, Download, Play, Tag } from 'lucide-react';
import '../styles/GameModal.css';

// Типизация (подставь свои типы)
interface Game {
  id: string;
  title: string;
  coverUrl: string;       // Вертикальная обложка
  backdropUrl?: string;   // Горизонтальный фон (если есть, иначе coverUrl)
  description: string;
  rating?: number;
  releaseYear?: string;
  tags: string[];
  subgenres: string[];
}

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
  if (!game) return null;

  // Блокируем скролл страницы при открытом окне
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Используем фон или обложку размытую
  const bgImage = game.backdropUrl || game.coverUrl;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Кнопка закрытия (плавающая) */}
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Хедер с фоном (Backdrop) */}
        <div 
          className="modal-hero" 
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <img src={game.coverUrl} alt={game.title} className="hero-poster" />
            <div className="hero-info">
              <h2 className="game-title">{game.title}</h2>
              
              <div className="meta-row">
                {game.releaseYear && (
                  <span className="meta-badge">
                    <Calendar size={14} /> {game.releaseYear}
                  </span>
                )}
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

        {/* Контентная часть (скроллится) */}
        <div className="modal-body custom-scrollbar">
          
          <div className="modal-section">
            <h3>About</h3>
            <p className="description-text">{game.description}</p>
          </div>

          <div className="modal-section">
            <h3>Tags & Genres</h3>
            <div className="tags-cloud">
              {game.subgenres.map(sg => (
                <span key={sg} className="tag-pill subgenre">{sg}</span>
              ))}
              {game.tags.map(tag => (
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
