import { RawGame, Game } from '../types';

export function sanitizeGameData(rawGame: RawGame): Game {
  // Унификация описания
  let description = rawGame.description || 
                   rawGame.shortdescription || 
                   rawGame.aboutthegame || 
                   'No description available';

  // Очистка HTML тегов из описания (опционально, но полезно для превью)
  // const cleanDesc = description.replace(/<[^>]*>?/gm, '');

  // Унификация изображений
  const image = rawGame.headerimage || rawGame.image || '/placeholder.jpg';

  // Унификация Steam URL
  const steamurl = rawGame.steamurl || rawGame.url || '#';

  // Унификация рейтинга
  const rating = rawGame.rating || rawGame.reviewscore || '';

  // 🆕 ИСПРАВЛЕНИЕ: Проверяем оба варианта написания ключей для похожих игр
  // Используем 'as any', чтобы обойти проверку типов и достать данные из JSON, 
  // даже если они не совпадают с интерфейсом RawGame
  const rawAny = rawGame as any;
  
  const similargames = rawGame.similargames || rawAny.similar_games || [];
  const similargamessummary = rawGame.similargamessummary || rawAny.similar_games_summary || '';

  return {
    id: rawGame.id ? String(rawGame.id) : `game-${Math.random().toString(36).substr(2, 9)}`,
    name: rawGame.name || 'Unknown Game',
    image,
    steamurl,
    coop: rawGame.coop || 'Single',
    genre: rawGame.genre || 'Unknown',
    subgenres: Array.isArray(rawGame.subgenres) ? rawGame.subgenres : [],
    tags: Array.isArray(rawGame.tags) ? rawGame.tags : [],
    description, // Можно заменить на cleanDesc если нужно чистое текстовое превью
    rating,
    similargames,
    similargamessummary,
  };
}
