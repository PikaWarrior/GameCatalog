import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

/**
 * Вспомогательная функция для очистки массивов строк.
 * Если в JSON прилетел объект {name: "RPG"} вместо строки "RPG", она это исправит.
 */
const safeStringList = (input: any): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        // Пытаемся достать имя из популярных полей
        return item.name || item.description || item.tag || item.label || '';
      }
      return String(item || '');
    })
    .filter(str => str.trim().length > 0); // Убираем пустые
};

const deriveCoopStatus = (tags: string[], categories: string[]): string => {
  const combined = [...tags, ...categories].map(t => t.toLowerCase());
  const modes: string[] = [];

  const hasSingle = combined.some(t => t === 'single-player' || t === 'singleplayer');
  const hasMulti = combined.some(t => t.includes('multi-player') || t.includes('multiplayer') || t.includes('mmo') || t.includes('online') || t.includes('pvp'));
  const hasCoop = combined.some(t => t.includes('co-op') || t.includes('cooperative'));
  const hasSplit = combined.some(t => t.includes('split screen') || t.includes('shared/split') || t.includes('local'));

  if (hasSingle) modes.push('Single');
  if (hasMulti) modes.push('Multiplayer');
  if (hasCoop) modes.push('Co-op');
  if (hasSplit) modes.push('Split Screen');

  return modes.length > 0 ? modes.join(' / ') : 'Single';
};

export const sanitizeGameData = (raw: RawGame): Game => {
  // 1. Безопасное извлечение списков через новую функцию
  const rawTags = safeStringList(raw.tags);
  const rawGenres = safeStringList(raw.genres);
  const rawCategories = safeStringList(raw.categories);

  // 2. Картинка
  const image = raw.header_image || raw.image || '/fallback-game.jpg';

  // 3. Описание
  const descriptionRaw = raw.short_description || raw.description || raw.about_the_game || '';

  // 4. Режимы игры
  const coopString = (raw as any).coop || deriveCoopStatus(rawTags, rawCategories);

  // 5. Основной жанр
  let mainGenre = 'Action';
  if (rawGenres.length > 0) mainGenre = rawGenres[0];
  else if (rawTags.includes('Indie')) mainGenre = 'Indie';
  else if (rawTags.includes('RPG')) mainGenre = 'RPG';
  else if (rawTags.includes('Strategy')) mainGenre = 'Strategy';
  else if (rawTags.includes('Simulation')) mainGenre = 'Simulation';

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: image,
    steam_url: raw.steam_url || raw.url || raw.link || '#',
    coop: coopString,
    genre: mainGenre,
    tags: rawTags,
    subgenres: rawGenres, // Используем жанры как поджанры
    
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'h1', 'h2', 'h3'],
      allowedAttributes: {}
    }),

    rating: raw.review_score || raw.rating,
    
    // Обработка похожих игр
    similar_games: (raw.similar_games || []).map((sim: any) => ({
      name: sim.name || 'Unknown',
      image: sim.header_image || sim.image || '/fallback-game.jpg',
      url: sim.steam_url || sim.url || '#',
      id: sim.id || sim.steamId || (sim.url ? sim.url : `sim-${Math.random()}`)
    }))
  };
};
