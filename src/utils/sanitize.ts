// src/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import { Game, RawGame } from '../types';

/**
 * Функция для генерации строки кооператива на основе тегов и категорий Steam.
 * Нужна для совместимости со старой логикой фильтрации.
 */
const deriveCoopStatus = (tags: string[], categories: string[]): string => {
  const combined = [...tags, ...categories].map(t => t.toLowerCase());
  const modes: string[] = [];

  // Логика определения режимов
  const hasSingle = combined.some(t => t === 'single-player' || t === 'singleplayer');
  const hasMulti = combined.some(t => t === 'multi-player' || t === 'multiplayer' || t === 'mmo' || t === 'online pvp');
  const hasCoop = combined.some(t => t === 'co-op' || t === 'online co-op' || t === 'lan co-op' || t === 'cooperative');
  const hasSplit = combined.some(t => t.includes('split screen') || t.includes('shared/split') || t === 'local co-op');

  if (hasSingle) modes.push('Single');
  if (hasMulti) modes.push('Multiplayer');
  if (hasCoop) modes.push('Co-op');
  if (hasSplit) modes.push('Split Screen');

  // Если не удалось определить, считаем синглом по умолчанию
  return modes.length > 0 ? modes.join(' / ') : 'Single';
};

export const sanitizeGameData = (raw: RawGame): Game => {
  // 1. Безопасное получение массивов
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const rawGenres = Array.isArray(raw.genres) ? raw.genres : [];
  const rawCategories = Array.isArray(raw.categories) ? raw.categories : [];

  // 2. Определение картинки (фоллбек, если нет в json)
  const image = raw.header_image || raw.image || '/fallback-game.jpg';

  // 3. Определение описания (приоритет: короткое -> полное -> об игре)
  const descriptionRaw = raw.short_description || raw.description || raw.about_the_game || '';

  // 4. Генерация строки режимов
  // Если в JSON уже есть поле coop (старый формат), используем его, иначе вычисляем
  const coopString = (raw as any).coop || deriveCoopStatus(rawTags, rawCategories);

  // 5. Определение основного жанра
  // Берем первый из списка genres или tags, либо 'Action' по умолчанию
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
    
    // Объединяем жанры и теги для полноты
    tags: rawTags,
    subgenres: rawGenres, 
    
    description: sanitizeHtml(descriptionRaw, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),

    rating: raw.review_score || raw.rating,
    similar_games: raw.similar_games || []
  };
};
