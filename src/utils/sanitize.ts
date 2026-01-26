// src/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

/**
 * ФУНДАМЕНТАЛЬНАЯ ФУНКЦИЯ ОЧИСТКИ.
 * Превращает массив чего угодно (объектов, чисел, null) в массив чистых строк.
 * Это предотвращает ошибку "Objects are not valid as a React child".
 */
const safeStringList = (input: any): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .map(item => {
      // 1. Если уже строка - отлично
      if (typeof item === 'string') return item;
      
      // 2. Если число - в строку
      if (typeof item === 'number') return String(item);
      
      // 3. Если объект - ищем поле с названием
      if (item && typeof item === 'object') {
        return item.name || item.value || item.label || item.description || item.tag || '';
      }
      
      return '';
    })
    // Убираем пустые и слишком короткие строки
    .filter(str => str && str.trim().length > 0);
};

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
  // 1. Принудительная очистка всех списков
  const rawTags = safeStringList(raw.tags);
  const rawGenres = safeStringList(raw.genres);
  const rawCategories = safeStringList(raw.categories);

  const image = raw.header_image || raw.image || '/fallback-game.jpg';
  const descriptionRaw = raw.short_description || raw.description || raw.about_the_game || '';
  
  // 2. Безопасное получение кооператива
  const coopString = raw.coop || deriveCoopStatus(rawTags, rawCategories);

  // 3. Определение жанра
  let mainGenre = 'Action';
  if (rawGenres.length > 0) mainGenre = rawGenres[0];
  else if (rawTags.includes('Indie')) mainGenre = 'Indie';
  else if (rawTags.includes('RPG')) mainGenre = 'RPG';
  else if (rawTags.includes('Strategy')) mainGenre = 'Strategy';
  else if (rawTags.includes('Simulation')) mainGenre = 'Simulation';

  // 4. Безопасная обработка похожих игр
  const safeSimilar = (Array.isArray(raw.similar_games) ? raw.similar_games : []).map((sim: any) => ({
    name: sim.name || 'Unknown',
    image: sim.header_image || sim.image || '/fallback-game.jpg',
    url: sim.steam_url || sim.url || '#',
    // Генерируем ID, если его нет
    id: sim.id || sim.steamId || (sim.url ? sim.url : `sim-${Math.random()}`)
  }));

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: image,
    steam_url: raw.steam_url || raw.url || raw.link || '#',
    coop: coopString,
    genre: mainGenre,
    
    tags: rawTags,        // Теперь здесь ГАРАНТИРОВАННО строки
    subgenres: rawGenres, // Здесь тоже
    
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'h1', 'h2', 'h3'],
      allowedAttributes: {}
    }),

    rating: raw.review_score || raw.rating,
    similar_games: safeSimilar
  };
};
