import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

// Вспомогательная функция для поиска поля (учитывает регистр и вариации)
const findField = (obj: any, keys: string[]) => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
};

// Простой список строк без агрессивной "магии"
const getStringList = (input: any): string[] => {
  if (!Array.isArray(input)) return [];
  return input.map(String).filter(s => s.trim().length > 0);
};

const deriveCoopStatus = (tags: string[], categories: string[]): string => {
  const combined = [...tags, ...categories].map(t => t.toLowerCase());
  const modes: string[] = [];

  const hasSingle = combined.some(t => t.includes('single'));
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
  // 1. Ищем поля по возможным именам (важно для совместимости с разными парсерами)
  // Приоритет: subgenres (как в старом коде) -> genres -> Genres
  const rawSubgenres = findField(raw, ['subgenres', 'genres', 'Genres', 'steam_genres']) || [];
  // Приоритет: tags -> Tags -> steam_tags -> categories
  const rawTags = findField(raw, ['tags', 'Tags', 'steam_tags', 'categories']) || [];
  
  // Для категорий (кооп/сингл)
  const rawCategories = findField(raw, ['categories', 'Categories']) || [];

  const cleanTags = getStringList(rawTags);
  const cleanSubgenres = getStringList(rawSubgenres);
  const cleanCategories = getStringList(rawCategories);

  // 2. Картинка и описание
  const image = findField(raw, ['header_image', 'image', 'cover']) || '/fallback-game.jpg';
  const descriptionRaw = findField(raw, ['short_description', 'description', 'about_the_game']) || '';

  // 3. Режимы игры
  const coopString = raw.coop || deriveCoopStatus(cleanTags, cleanCategories);

  // 4. Основной жанр
  let mainGenre = 'Action';
  if (cleanSubgenres.length > 0) mainGenre = cleanSubgenres[0];
  else if (cleanTags.includes('Indie')) mainGenre = 'Indie';
  else if (cleanTags.includes('Strategy')) mainGenre = 'Strategy';
  else if (cleanTags.includes('RPG')) mainGenre = 'RPG';

  // 5. Похожие игры
  // Простая проверка и маппинг, без лишних оберток
  const rawSimilar = findField(raw, ['similar_games', 'similar']) || [];
  const similarGames = Array.isArray(rawSimilar) ? rawSimilar.map((sim: any) => ({
    name: sim.name || 'Unknown',
    image: sim.header_image || sim.image || '/fallback-game.jpg',
    url: sim.steam_url || sim.url || '#',
    id: sim.id || sim.steamId || (sim.url ? sim.url : `sim-${Math.random()}`)
  })) : [];

  return {
    id: raw.id ? String(raw.id) : `gen-${Math.random().toString(36).substr(2, 9)}`,
    name: raw.name || 'Unknown Game',
    image: image,
    steam_url: raw.steam_url || raw.url || raw.link || '#',
    coop: coopString,
    genre: mainGenre,
    tags: cleanTags,
    subgenres: cleanSubgenres, // Теперь точно не будет пустым, если поле subgenres есть в JSON
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),
    rating: raw.review_score || raw.rating,
    similar_games: similarGames
  };
};
