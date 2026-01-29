import React, { useEffect, useRef } from 'react';
import {
  X, Star, Play, FileText, Tag,
  Gamepad2, Users, Globe, Monitor, User,
  Sword, Scroll, Brain, Hammer, Ghost,
  Trophy, Car, Rocket, Puzzle, Coffee,
  Skull, Crosshair, Map, Dna, Music,
  Heart, Share2 // Добавлен Share2 для кнопки Share
} from 'lucide-react';
import { ProcessedGame } from '../types';
import '../styles/GameModal.css';

interface GameModalProps {
  game: ProcessedGame | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const GameModal: React.FC<GameModalProps> = ({
  game,
  onClose,
  isFavorite = false,
  onToggleFavorite
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const ICON_SIZE = 16;
  const ICON_STROKE = 2.5;

  if (!game) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;
  }, [game.id]);

  // НОВАЯ ФУНКЦИЯ: Копирование ссылки на игру
  const handleShareGame = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('game', game.id);
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  // --- КООП ЛОГИКА ---
  const getCoopDetails = (coop: string) => {
    const lower = (coop || '').toLowerCase();
    if (lower.includes('single')) return { color: '#64748b', icon: <User size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Single' };
    if (lower.includes('split') || lower.includes('shared')) return { color: '#ea580c', icon: <Monitor size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Split Screen' };
    if (lower.includes('online') || lower.includes('multi')) return { color: '#7c3aed', icon: <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Multiplayer' };
    return { color: '#059669', icon: <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Co-op' };
  };

  // --- ЖАНР ЛОГИКА ---
  const getGenreDetails = (genre: string) => {
    const g = (genre || '').toLowerCase();
    if (g.includes('action') || g.includes('hack') || g.includes('fighting')) return { color: '#dc2626', icon: <Sword size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('shooter') || g.includes('fps')) return { color: '#b91c1c', icon: <Crosshair size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('adventure')) return { color: '#059669', icon: <Map size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('rpg')) return { color: '#16a34a', icon: <Scroll size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('rogue') || g.includes('dungeon')) return { color: '#d97706', icon: <Dna size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
    if (g.includes('metroidvania') || g.includes('platformer')) return { color: '#db2777', icon: <Rocket size={ICON_SIZE} strokeWidth={ICON_STROKE} /> };
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* HERO SECTION */}
        <div className="modal-hero">
          <img src={image} alt={name} className="modal-image" />
          <div className="modal-hero-overlay">
            <h2 className="modal-title">{name}</h2>
            <div className="modal-meta">
              <span className="modal-genre" style={{ backgroundColor: genreInfo.color }}>
                {genreInfo.icon} {genre}
              </span>
              <span className="modal-coop" style={{ backgroundColor: coopInfo.color }}>
                {coopInfo.icon} {coopInfo.label}
              </span>
              {rating && (
                <span className="modal-rating">
                  <Star size={ICON_SIZE} fill="#fbbf24" stroke="#fbbf24" strokeWidth={ICON_STROKE} /> {rating}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <a
            href={`https://store.steampowered.com/search/?term=${encodeURIComponent(name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Play size={16} strokeWidth={2.5} /> Open Steam
          </a>

          {/* КНОПКА ИЗБРАННОГО В МОДАЛКЕ */}
          {onToggleFavorite && (
            <button
              className={`btn-favorite ${isFavorite ? 'active' : ''}`}
              onClick={onToggleFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} strokeWidth={2.5} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
          )}

          {/* НОВАЯ КНОПКА: Share Game */}
          <button
            className="btn-share"
            onClick={handleShareGame}
            title="Copy link to this game"
          >
            <Share2 size={16} strokeWidth={2.5} />
            Share
          </button>
        </div>

        <div className="modal-body">
          {/* LEFT COLUMN: Description & Tags */}
          <div className="modal-left">
            <section className="modal-section">
              <h3 className="section-title">
                <FileText size={18} strokeWidth={2.5} /> About
              </h3>
              <p className="modal-description">{game.sanitizedDescription}</p>
            </section>

            <section className="modal-section">
              <h3 className="section-title">
                <Tag size={18} strokeWidth={2.5} /> Tags & Subgenres
              </h3>
              <div className="modal-tags">
                {subgenres.map((sg, i) => (
                  <span key={`sg-${i}`} className="tag subgenre">{sg}</span>
                ))}
                {tags.map((tag, i) => (
                  <span key={`tag-${i}`} className="tag">{tag}</span>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Similar Games Summary */}
          {similar_games_summary && similar_games_summary.length > 0 && (
            <aside className="modal-sidebar">
              <h3 className="section-title">
                <Gamepad2 size={18} strokeWidth={2.5} /> Similar Games
              </h3>
              <ul className="similar-games-list">
                {similar_games_summary.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameModal;
