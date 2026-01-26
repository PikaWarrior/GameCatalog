import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

/**
 * АГРЕССИВНАЯ очистка списков.
 * Превращает всё (объекты, null, undefined) в массив строк.
 */
const safeStringList = (input: any): string[] => {
  // 1. Если это вообще не массив (например, null или undefined), возвращаем пустой массив
  if (!Array.isArray(input)) return [];
  
  return input
    .map(item => {
      // Если строка - оставляем
      if (typeof item === 'string') return item;
      // Если число - превращаем в строку
      if (typeof item === 'number') return String(item);
      // Если объект - пытаемся вытащить имя
      if (item && typeof item === 'object') {
        return item.name || item.value || item.label || item.description || '';
      }
      return '';
    })
    // Фильтруем пустые строки и мусор
    .filter(str => str && str.trim().length > 0);
};

// Функция определения коопа (без изменений)
const deriveCoopStatus = (tags: string[], categories: string[]): string => {
  const combined = [...tags, ...categories].map(t => t.toLowerCase());
  const modes: string[] = [];
  const hasSingle = combined.some(t => t === 'single-player' || t === 'singleplayer');
  const hasMulti = combined.some(t => t.includes('multi') || t.includes('mmo') || t.includes('pvp') || t.includes('online'));
  const hasCoop = combined.some(t => t.includes('co-op') || t.includes('cooperative'));
  const hasSplit = combined.some(t => t.includes('split') || t.includes('shared') || t.includes('local'));

  if (hasSingle) modes.push('Single');
  if (hasMulti) modes.push('Multiplayer');
  if (hasCoop) modes.push('Co-op');
  if (hasSplit) modes.push('Split Screen');

  return modes.length > 0 ? modes.join(' / ') : 'Single';
};

export const sanitizeGameData = (raw: RawGame): Game => {
  // 1. Жестко чистим все списки
  const rawTags = safeStringList(raw.tags);
  const rawGenres = safeStringList(raw.genres);
  const rawCategories = safeStringList(raw.categories);
  
  // Для отладки: выведем первую игру в консоль, чтобы убедиться, что теги стали строками
  if (raw.id === 1 || raw.name === 'Test') {
     console.log('Sanitized Tags:', rawTags); 
  }

  const image = raw.header_image || raw.image || '/fallback-game.jpg';
  const descriptionRaw = raw.short_description || raw.description || raw.about_the_game || '';
  
  // Безопасно берем coop, если его нет - вычисляем
  const coopString = (raw as any).coop || deriveCoopStatus(rawTags, rawCategories);

  // Определение жанра
  let mainGenre = 'Action';
  if (rawGenres.length > 0) mainGenre = rawGenres[0];
  else if (rawTags.includes('Indie')) mainGenre = 'Indie';
  else if (rawTags.includes('RPG')) mainGenre = 'RPG';
  else if (rawTags.includes('Strategy')) mainGenre = 'Strategy';

  // Обработка похожих игр
  const safeSimilar = (Array.isArray(raw.similar_games) ? raw.similar_games : []).map((sim: any) => ({
    name: sim.name || 'Unknown',
    image: sim.header_image || sim.image || '/fallback-game.jpg',
    url: sim.steam_url || sim.url || '#',
    id: sim.id || sim.steamId || (sim.url ? sim.url : `sim-${Math.random()}`)
  }));

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: image,
    steam_url: raw.steam_url || raw.url || raw.link || '#',
    coop: coopString,
    genre: mainGenre,
    tags: rawTags,        // Теперь это ГАРАНТИРОВАННО массив строк
    subgenres: rawGenres, // И это тоже
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),
    rating: raw.review_score || raw.rating,
    similar_games: safeSimilar
  };
};
