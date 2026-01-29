import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Star, Play, FileText, Tag, Gamepad2, Users, Globe, Monitor, User,
  Sword, Scroll, Brain, Hammer, Ghost, Trophy, Car, Rocket, Puzzle, Coffee,
  Skull, Crosshair, Map, Dna, Music, Heart, Link as LinkIcon, Check 
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose, isFavorite = false, onToggleFavorite }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const ICON_SIZE = 16;

  if (!game) return null;

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = 'unset'; }; }, []);
  useEffect(() => { 
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleEsc); return () => window.removeEventListener('keydown', handleEsc); 
  }, [onClose]);
  useEffect(() => { if (modalRef.current) modalRef.current.scrollTop = 0; setCopySuccess(false); }, [game.id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#game=${encodeURIComponent(game.name)}`;
    navigator.clipboard.writeText(url).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); });
  };

  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    if (lower.includes('single')) return { color: '#64748b', icon: <User size={ICON_SIZE} />, label: 'Single' };
    if (lower.includes('split') || lower.includes('shared')) return { color: '#ea580c', icon: <Monitor size={ICON_SIZE} />, label: 'Split Screen' };
    if (lower.includes('online') || lower.includes('multi')) return { color: '#7c3aed', icon: <Globe size={ICON_SIZE} />, label: 'Multiplayer' };
    return { color: '#059669', icon: <Users size={ICON_SIZE} />, label: 'Co-op' };
  };

  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action')) return { color: '#dc2626', icon: <Sword size={ICON_SIZE} /> };
    if (g.includes('adventure')) return { color: '#059669', icon: <Map size={ICON_SIZE} /> };
    if (g.includes('rpg')) return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} /> };
    // ... можно добавить остальные маппинги, но для краткости оставим дефолт
    return { color: '#475569', icon: <Gamepad2 size={ICON_SIZE} /> };
  };

  const { name, image, genre, rating, subgenres, tags, similar_games_summary } = game;
  const genreInfo = getGenreDetails(genre);
  const coopInfo = getCoopDetails(game.normalizedCoop);
  let similarGamesList = [];
  try { similarGamesList = typeof game.similar_games === 'string' ? JSON.parse(game.similar_games) : (game.similar_games || []); } catch (e) { similarGamesList = []; }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hero">
          <img src={image} alt={name} className="hero-image" />
          <div className="hero-overlay"></div>
          <div className="hero-content">
             <h2 className="game-title">{name}</h2>
             <div className="hero-badges">
                <span className="hero-badge" style={{ backgroundColor: genreInfo.color }}>{genreInfo.icon} {genre}</span>
                <span className="hero-badge" style={{ backgroundColor: coopInfo.color }}>{coopInfo.icon} {coopInfo.label}</span>
                {rating && <span className="hero-badge rating-badge"><Star size={14} fill="currentColor" /> {rating}</span>}
             </div>
          </div>
          <div className="modal-controls">
             <button className={`control-btn ${copySuccess ? 'success' : ''}`} onClick={handleCopyLink} title="Copy Link">
                {copySuccess ? <Check size={20} /> : <LinkIcon size={20} />}
             </button>
             <a href={game.steam_url} target="_blank" rel="noopener noreferrer" className="control-btn steam" title="Open on Steam"><Play size={20} fill="currentColor" /> Open Steam</a>
             <button className="control-btn close" onClick={onClose}><X size={24} /></button>
          </div>
        </div>
        <div className="modal-body">
           <div className="modal-main-col">
              {onToggleFavorite && (
                 <button className={`modal-fav-btn ${isFavorite ? 'active' : ''}`} onClick={onToggleFavorite}>
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                 </button>
              )}
              <div className="info-section"><h3><FileText size={18} /> About</h3><p className="description-text">{game.sanitizedDescription || game.description}</p></div>
              <div className="info-section">
                 <h3><Tag size={18} /> Tags & Subgenres</h3>
                 <div className="tags-cloud-modal">
                    {subgenres.map(sg => <span key={sg} className="modal-tag subgenre">{sg}</span>)}
                    {tags.map(t => <span key={t} className="modal-tag">{t}</span>)}
                 </div>
              </div>
           </div>
           <div className="modal-side-col">
              {game.similar_games_summary && <div className="info-section summary-section"><h3><Brain size={18} /> Why play this?</h3><p>{game.similar_games_summary}</p></div>}
              {similarGamesList.length > 0 && (
                <div className="info-section"><h3><Gamepad2 size={18} /> Similar Games</h3>
                   <div className="similar-games-list">
                      {similarGamesList.map((s: any, i: number) => (
                         <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="similar-game-item"><img src={s.image} alt={s.name} /><span>{s.name}</span></a>
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
