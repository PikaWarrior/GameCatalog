// src/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

const deriveCoopStatus = (tags: string[], categories: string[]): string => {
  const combined = [...tags, ...categories].map(t => t.toLowerCase());
  const modes: string[] = [];

  const hasSingle = combined.some(t => t === 'single-player' || t === 'singleplayer');
  const hasMulti = combined.some(t => t === 'multi-player' || t === 'multiplayer' || t === 'mmo' || t === 'online pvp');
  const hasCoop = combined.some(t => t === 'co-op' || t === 'online co-op' || t === 'lan co-op' || t === 'cooperative');
  const hasSplit = combined.some(t => t.includes('split screen') || t.includes('shared/split') || t === 'local co-op');

  if (hasSingle) modes.push('Single');
  if (hasMulti) modes.push('Multiplayer');
  if (hasCoop) modes.push('Co-op');
  if (hasSplit) modes.push('Split Screen');

  return modes.length > 0 ? modes.join(' / ') : 'Single';
};

export const sanitizeGameData = (raw: RawGame): Game => {
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const rawGenres = Array.isArray(raw.genres) ? raw.genres : [];
  const rawCategories = Array.isArray(raw.categories) ? raw.categories : [];

  const image = raw.header_image || raw.image || '/fallback-game.jpg';
  const descriptionRaw = raw.short_description || raw.description || raw.about_the_game || '';
  const coopString = (raw as any).coop || deriveCoopStatus(rawTags, rawCategories);

  let mainGenre = 'Action';
  if (rawGenres.length > 0) {
    mainGenre = rawGenres[0];
  } else if (rawTags.includes('Indie')) {
    mainGenre = 'Indie';
  } else if (rawTags.includes('Strategy')) {
    mainGenre = 'Strategy';
  } else if (rawTags.includes('RPG')) {
    mainGenre = 'RPG';
  }

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: image,
    steam_url: raw.steam_url || raw.url || raw.link || '#',
    coop: coopString,
    genre: mainGenre,
    tags: rawTags,
    subgenres: rawGenres,
    
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),

    rating: raw.review_score || raw.rating,
    
    // ВАЖНОЕ ИЗМЕНЕНИЕ:
    // Мы берем похожие игры и ГЕНЕРИРУЕМ для них ID, так как в JSON его нет.
    // Это решает проблему совместимости типов и ключей React.
    similar_games: (raw.similar_games || []).map((sim: any) => ({
      name: sim.name,
      image: sim.image || '/fallback-game.jpg',
      url: sim.url,
      // Если ID нет, используем URL или Имя как уникальный ключ
      id: sim.id || sim.url || sim.name
    }))
  };
};
