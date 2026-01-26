// src/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

const cleanDescription = (html: string) => {
  if (!html) return 'No description available.';
  
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'h1', 'h2', 'h3', 'div', 'span'],
    allowedAttributes: {
      '*': ['style', 'class']
    }
  });
};

const cleanList = (input: any): string[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map(item => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return item.name || item.value || item.description || '';
      }
      return String(item);
    })
    .filter(str => str.length > 0);
};

const deriveCoopStatus = (existingCoop: string | undefined, tags: string[]): string => {
  if (existingCoop && existingCoop !== 'Unknown') return existingCoop;

  const lowerTags = tags.map(t => String(t).toLowerCase());
  const modes: string[] = [];

  if (lowerTags.some(t => t === 'single-player' || t === 'single')) modes.push('Single');
  if (lowerTags.some(t => t.includes('multi') || t.includes('mmo') || t.includes('online'))) modes.push('Multiplayer');
  if (lowerTags.some(t => t.includes('co-op') || t.includes('cooperative'))) modes.push('Co-op');
  if (lowerTags.some(t => t.includes('split') || t.includes('local'))) modes.push('Split Screen');

  return modes.length > 0 ? modes.join(' / ') : 'Single';
};

export const sanitizeGameData = (raw: RawGame): Game => {
  const genre = raw.genre || 'Unknown';
  const subgenres = Array.isArray(raw.subgenres) ? raw.subgenres : [];
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  
  const similarSummary = cleanList(raw.similar_games_summary);
  const coop = deriveCoopStatus(raw.coop, tags);

  // Теперь TypeScript не будет ругаться, так как about_the_game есть в интерфейсе
  const rawDesc = raw.description || raw.about_the_game || raw.short_description || '';
  const description = cleanDescription(rawDesc);

  const similar = (Array.isArray(raw.similar_games) ? raw.similar_games : []).map((sim: any) => ({
    name: sim.name || 'Unknown',
    image: sim.image || sim.header_image || '/fallback-game.jpg',
    url: sim.url || sim.steam_url || '#',
    id: sim.id || sim.url || `sim-${Math.random()}`
  }));

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: raw.image || raw.header_image || '/fallback-game.jpg',
    steam_url: raw.steam_url || raw.url || '#',
    genre: genre,
    subgenres: subgenres,
    tags: tags,
    coop: coop,
    description: description,
    rating: raw.review_score || raw.rating,
    similar_games: similar,
    similar_games_summary: similarSummary
  };
};
