// src/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

// Функция для очистки HTML от мусора
const cleanDescription = (html: string) => {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'h1', 'h2'],
    allowedAttributes: {} // Убираем классы и стили, оставляем чистую структуру
  });
};

// Функция определения коопа (твоя логика)
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
  // 1. ЖАНР: Берем строку напрямую. Если пусто - 'Unknown'
  const genre = raw.genre || 'Unknown';

  // 2. СПИСКИ: Убеждаемся, что это массивы
  const subgenres = Array.isArray(raw.subgenres) ? raw.subgenres : [];
  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  // 3. КООП
  const coop = deriveCoopStatus(raw.coop, tags);

  // 4. ОПИСАНИЕ
  const rawDesc = raw.description || raw.short_description || '';
  const description = cleanDescription(rawDesc);

  // 5. ПОХОЖИЕ ИГРЫ (с генерацией ID)
  const similar = (Array.isArray(raw.similar_games) ? raw.similar_games : []).map((sim: any) => ({
    name: sim.name || 'Unknown',
    image: sim.image || sim.header_image || '/fallback-game.jpg',
    url: sim.url || sim.steam_url || '#',
    id: sim.id || sim.url || `sim-${Math.random()}` // Генерируем ID для React ключей
  }));

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: raw.image || raw.header_image || '/fallback-game.jpg',
    steam_url: raw.steam_url || raw.url || '#',
    
    // ПРЯМОЕ СООТВЕТСТВИЕ ПОЛЕЙ
    genre: genre,
    subgenres: subgenres,
    tags: tags,
    
    coop: coop,
    description: description,
    rating: raw.review_score || raw.rating,
    similar_games: similar
  };
};
