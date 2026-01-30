import { RawGame, Game } from '../types';

export function sanitizeGameData(rawGame: RawGame): Game {
  // Унификация описания
  let description = rawGame.description || 
                   rawGame.shortdescription || 
                   rawGame.aboutthegame || 
                   'No description available';

  // Обрезка до 300 символов (если нужно, можно раскомментировать, но лучше оставить полное)
  /* if (description.length > 300) {
    description = description.slice(0, 300) + '...';
  } */

  // Унификация изображений
  const image = rawGame.headerimage || rawGame.image || '/placeholder.jpg';

  // Унификация Steam URL
  const steamurl = rawGame.steamurl || rawGame.url || '#';

  // Унификация рейтинга
  const rating = rawGame.rating || rawGame.reviewscore || '';

  // Унификация similar games
  // Приводим к lowercase camelCase, как в types.ts
  const similargames = rawGame.similargames || [];
  const similargamessummary = rawGame.similargamessummary || '';

  return {
    id: rawGame.id ? String(rawGame.id) : `game-${Math.random().toString(36).substr(2, 9)}`,
    name: rawGame.name || 'Unknown Game',
    image,
    steamurl,
    coop: rawGame.coop || 'Single',
    genre: rawGame.genre || 'Unknown',
    subgenres: Array.isArray(rawGame.subgenres) ? rawGame.subgenres : [],
    tags: Array.isArray(rawGame.tags) ? rawGame.tags : [],
    description,
    rating,
    similargames,
    similargamessummary,
  };
}
