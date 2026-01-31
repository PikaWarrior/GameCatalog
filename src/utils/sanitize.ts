import { RawGame, Game } from '../types';

export function sanitizeGameData(rawGame: RawGame): Game {
  // Унификация описания
  let description = rawGame.description || 
                   rawGame.short_description || 
                   rawGame.about_the_game || 
                   'No description available';

  // Очистка HTML тегов для превью (опционально)
  // const cleanDesc = description.replace(/<[^>]*>?/gm, '');

  // Унификация изображений
  const image = rawGame.header_image || rawGame.image || '/placeholder.jpg';

  // Унификация Steam URL
  // Проверяем все возможные поля и ставим '#' если ничего нет
  let steamUrl = rawGame.steam_url || rawGame.url || '#';
  if (steamUrl !== '#' && !steamUrl.startsWith('http')) {
     // Фикс для ссылок без протокола (редкий кейс, но бывает)
     if (steamUrl.startsWith('store.steampowered')) {
        steamUrl = 'https://' + steamUrl;
     }
  }

  // Унификация рейтинга
  const rating = rawGame.rating || rawGame.review_score || '';

  // Унификация похожих игр (snake_case -> camelCase)
  // Используем 'as any' для доступа к сырым полям, если TS ругается
  const rawAny = rawGame as any;
  const similarGames = rawGame.similar_games || rawAny.similargames || [];
  
  // Нормализуем ссылки внутри похожих игр
  const cleanSimilarGames = Array.isArray(similarGames) ? similarGames.map((sim: any) => ({
    ...sim,
    url: sim.url || sim.steam_url || sim.steamUrl || '#'
  })) : [];

  const similarGamesSummary = rawGame.similar_games_summary || rawAny.similargamessummary || [];

  const id = rawGame.id ? String(rawGame.id) : `game-${Math.random().toString(36).substr(2, 9)}`;

  // Создаем slug для ссылок
  const slug = rawGame.name 
    ? rawGame.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : id;

  return {
    id,
    name: rawGame.name || 'Unknown Game',
    image,
    steamUrl, // Используем новое имя поля
    coop: rawGame.coop || 'Single',
    genre: rawGame.genre || 'Unknown',
    subgenres: Array.isArray(rawGame.subgenres) ? rawGame.subgenres : [],
    tags: Array.isArray(rawGame.tags) ? rawGame.tags : [],
    description, 
    rating,
    similarGames: cleanSimilarGames, // Используем новое имя поля
    similarGamesSummary,            // Используем новое имя поля
    slug
  };
}
