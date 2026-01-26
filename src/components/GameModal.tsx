import React, { useEffect } from 'react';
import { X, ExternalLink, Gamepad2 } from 'lucide-react';
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
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => { 
      document.body.style.overflow = 'unset'; 
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={24} /></button>

        <div className="modal-header">
          <img src={game.image} alt={game.name} className="modal-cover" onError={(e) => (e.currentTarget.src = '/fallback-game.jpg')} />
          <div className="modal-title-overlay">
            <h1>{game.name}</h1>
            <div className="modal-badges">
              <span className="modal-badge">{game.genre}</span>
              <span className="modal-badge">{game.coop}</span>
            </div>
          </div>
        </div>

        <div className="modal-body-scroll">
          {game.steam_url && (
            <a href={game.steam_url} target="_blank" rel="noreferrer" className="steam-link-btn">
              <Gamepad2 size={18} /> Open in Steam
            </a>
          )}

          <div className="modal-desc" dangerouslySetInnerHTML={{ __html: game.sanitizedDescription || game.description }} />

          <div className="modal-tags-block">
            <h3>Tags</h3>
            <div className="modal-tags-list">
              {game.subgenres.map(s => <span key={s} className="tag sub">{s}</span>)}
              {game.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          {/* НОВАЯ СЕКЦИЯ ПОХОЖИХ ИГР */}
          {game.similar_games && game.similar_games.length > 0 && (
            <div className="similar-games-section">
              <h3>Similar Games</h3>
              <div className="similar-grid">
                {game.similar_games.map((sim, i) => (
                  <a key={i} href={sim.url} target="_blank" rel="noreferrer" className="similar-card">
                    <img src={sim.image} alt={sim.name} onError={(e) => (e.currentTarget.src = '/fallback-game.jpg')} />
                    <span>{sim.name}</span>
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
