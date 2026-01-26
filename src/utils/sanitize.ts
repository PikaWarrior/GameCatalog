import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

/**
 * Очищает списки. Гарантирует, что на выходе будет массив строк.
 * Спасает модалку от краша "Objects are not valid as a React child".
 */
const cleanList = (input: any): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .map(item => {
      // Если это строка — просто берем её
      if (typeof item === 'string') return item.trim();
      // Если это объект (например {id: 1, name: "RPG"}) — пытаемся достать имя
      if (item && typeof item === 'object') {
        return item.name || item.value || item.description || '';
      }
      // Если число или что-то еще
      return String(item);
    })
    .filter(str => str.length > 0); // Убираем пустые
};

// Простая логика определения кооператива (без изменений)
const deriveCoopStatus = (coopField: string | undefined, tags: string[]): string => {
  // 1. Если в JSON уже есть поле coop (например "Single"), используем его
  if (coopField && typeof coopField === 'string' && coopField.length > 0) {
    return coopField;
  }

  // 2. Иначе пытаемся определить по тегам
  const lowerTags = tags.map(t => t.toLowerCase());
  const modes: string[] = [];

  const hasSingle = lowerTags.some(t => t === 'single-player' || t === 'singleplayer');
  const hasMulti = lowerTags.some(t => t.includes('multi') || t.includes('mmo') || t.includes('online'));
  const hasCoop = lowerTags.some(t => t.includes('co-op') || t.includes('cooperative'));
  const hasSplit = lowerTags.some(t => t.includes('split') || t.includes('local'));

  if (hasSingle) modes.push('Single');
  if (hasMulti) modes.push('Multiplayer');
  if (hasCoop) modes.push('Co-op');
  if (hasSplit) modes.push('Split Screen');

  return modes.length > 0 ? modes.join(' / ') : 'Single';
};

export const sanitizeGameData = (raw: RawGame): Game => {
  // --- ПРЯМОЙ МАППИНГ ПОЛЕЙ ---
  
  // 1. Жанр (Genre). Берем строго из raw.genre
  const mainGenre = (typeof raw.genre === 'string' && raw.genre.length > 0) 
    ? raw.genre 
    : 'Unknown Genre';

  // 2. Теги и Поджанры. Чистим через cleanList
  const tags = cleanList(raw.tags);
  const subgenres = cleanList(raw.subgenres);

  // 3. Картинка и описание
  const image = raw.header_image || raw.image || '/fallback-game.jpg';
  const descriptionRaw = raw.short_description || raw.description || raw.about_the_game || '';

  // 4. Кооператив
  const coopString = deriveCoopStatus(raw.coop, tags);

  // 5. Похожие игры (с генерацией ID для React ключей)
  const similarGames = (Array.isArray(raw.similar_games) ? raw.similar_games : []).map((sim: any) => ({
    name: sim.name || 'Unknown',
    image: sim.image || sim.header_image || '/fallback-game.jpg',
    url: sim.url || sim.steam_url || '#',
    id: sim.id || sim.url || `sim-${Math.random()}`
  }));

  return {
    // Если ID нет, генерируем случайный, чтобы список работал
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    
    name: raw.name || 'Unknown Game',
    image: image,
    steam_url: raw.steam_url || raw.url || raw.link || '#',
    
    // Прямой маппинг
    genre: mainGenre,
    subgenres: subgenres,
    tags: tags,
    
    coop: coopString,
    
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),

    rating: raw.review_score || raw.rating,
    similar_games: similarGames
  };
};
