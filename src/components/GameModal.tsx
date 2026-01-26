import React, { useEffect } from 'react';
import { X, Play, Tag, ExternalLink, Steam } from 'lucide-react'; // Убедитесь, что Steam/ExternalLink есть в lucide-react, если нет - используйте ExternalLink
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose }) => {
  if (!game) return null;

  // Блокировка скролла
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

  const { name, image, genre, coop, sanitizedDescription, description, tags, subgenres, similar_games, steam_url } = game;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* --- HEADER IMAGE --- */}
        <div className="modal-header">
          <img 
            src={image} 
            alt={name} 
            className="modal-cover"
            onError={(e) => (e.currentTarget.src = '/fallback-game.jpg')}
          />
          <div className="modal-header-gradient" />
          <div className="modal-title-container">
            <h1>{name}</h1>
            <div className="modal-meta-row">
              <span className="modal-badge genre">{genre}</span>
              <span className="modal-badge coop">{coop}</span>
            </div>
          </div>
        </div>

        <div className="modal-body-scroll">
          {/* --- ACTION BUTTONS --- */}
          <div className="modal-actions">
            {steam_url && (
              <a 
                href={steam_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-btn steam"
              >
                <ExternalLink size={18} />
                Open in Steam
              </a>
            )}
            {/* Можно добавить другие кнопки, например Play если есть локальный путь */}
          </div>

          {/* --- DESCRIPTION --- */}
          <div 
            className="modal-description"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription || description }}
          />

          {/* --- TAGS & SUBGENRES --- */}
          <div className="modal-tags-section">
            <h3><Tag size={16} /> Tags & Subgenres</h3>
            <div className="tags-cloud">
              {subgenres.map((sg, i) => (
                <span key={`sub-${i}`} className="tag-chip subgenre">{sg}</span>
              ))}
              {tags.map((tag, i) => (
                <span key={`tag-${i}`} className="tag-chip">{tag}</span>
              ))}
            </div>
          </div>

          {/* --- SIMILAR GAMES SECTION (NEW!) --- */}
          {similar_games && similar_games.length > 0 && (
            <div className="similar-games-section">
              <h3>You might also like</h3>
              <div className="similar-games-grid">
                {similar_games.map((sim, idx) => (
                  <a 
                    key={idx} 
                    href={sim.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="similar-game-card"
                  >
                    <div className="similar-game-image-wrapper">
                      <img 
                        src={sim.image} 
                        alt={sim.name} 
                        onError={(e) => (e.currentTarget.src = '/fallback-game.jpg')}
                      />
                      <div className="similar-game-overlay">
                        <ExternalLink size={16} />
                      </div>
                    </div>
                    <span className="similar-game-title">{sim.name}</span>
                  </a>
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
