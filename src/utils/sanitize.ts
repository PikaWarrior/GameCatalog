import DOMPurify from 'dompurify';
import sanitizeHtml, { IOptions } from 'sanitize-html';
import { Game, ValidationResult } from '../types';

// Конфигурация санитизации HTML
const SANITIZE_OPTIONS: IOptions = {
  allowedTags: [
    'b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code'
  ],
  allowedAttributes: {
    '*': ['class', 'style'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['data', 'http', 'https']
  },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
};

// Конфигурация DOMPurify
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: SANITIZE_OPTIONS.allowedTags,
  ALLOWED_ATTR: SANITIZE_OPTIONS.allowedAttributes,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  USE_PROFILES: { html: true },
  RETURN_TRUSTED_TYPE: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  IN_PLACE: true,
  ALLOW_ARIA_ATTR: true,
  ALLOW_DATA_ATTR: false,
};

/**
 * Санитизация текста от HTML и XSS атак
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  try {
    return DOMPurify.sanitize(text, DOMPURIFY_CONFIG);
  } catch (error) {
    console.error('Ошибка санитизации текста:', error);
    return text.replace(/[<>]/g, ''); // Базовая очистка
  }
};

/**
 * Санитизация HTML с сохранением безопасных тегов
 */
export const sanitizeHtmlContent = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  try {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
  } catch (error) {
    console.error('Ошибка санитизации HTML:', error);
    return sanitizeText(html);
  }
};

/**
 * Валидация URL Steam
 */
export const isValidSteamUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      'steamcommunity.com',
      'store.steampowered.com',
      'steamgames.com'
    ];
    
    return allowedDomains.some(domain => 
      parsed.hostname.includes(domain)
    ) && (
      parsed.protocol === 'http:' || 
      parsed.protocol === 'https:'
    );
  } catch {
    return false;
  }
};

/**
 * Валидация URL изображения
 */
export const isValidImageUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    return (
      allowedProtocols.includes(parsed.protocol) &&
      allowedExtensions.some(ext => 
        parsed.pathname.toLowerCase().endsWith(ext)
      )
    );
  } catch {
    return url.startsWith('/') || url.startsWith('./');
  }
};

/**
 * Валидация данных игры
 */
export const validateGameData = (game: Partial<Game>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Обязательные поля
  if (!game.name || typeof game.name !== 'string' || game.name.trim().length === 0) {
    errors.push('Игра должна иметь название');
  }
  
  if (!game.description || typeof game.description !== 'string') {
    errors.push('Игра должна иметь описание');
  }
  
  if (!game.genre || typeof game.genre !== 'string') {
    errors.push('Игра должна иметь жанр');
  }
  
  // Валидация URL
  if (game.steam_url && !isValidSteamUrl(game.steam_url)) {
    warnings.push(`Некорректный URL Steam: ${game.steam_url}`);
  }
  
  if (game.image && !isValidImageUrl(game.image)) {
    warnings.push(`Некорректный URL изображения: ${game.image}`);
  }
  
  // Валидация массивов
  if (!Array.isArray(game.tags)) {
    errors.push('Теги должны быть массивом');
  }
  
  if (!Array.isArray(game.subgenres)) {
    errors.push('Поджанры должны быть массивом');
  }
  
  // Ограничение длины
  if (game.name && game.name.length > 200) {
    warnings.push('Название игры слишком длинное');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Полная санитизация объекта игры
 */
export const sanitizeGameData = <T extends Partial<Game>>(data: T): T => {
  const sanitized = { ...data };
  
  // Санитизация текстовых полей
  if (typeof sanitized.name === 'string') {
    sanitized.name = sanitizeText(sanitized.name).substring(0, 200);
  }
  
  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitizeHtmlContent(sanitized.description);
  }
  
  if (typeof sanitized.genre === 'string') {
    sanitized.genre = sanitizeText(sanitized.genre);
  }
  
  if (typeof sanitized.coop === 'string') {
    sanitized.coop = sanitizeText(sanitized.coop);
  }
  
  // Санитизация массивов
  if (Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map(tag => sanitizeText(tag))
      .filter(tag => tag.length > 0);
  }
  
  if (Array.isArray(sanitized.subgenres)) {
    sanitized.subgenres = sanitized.subgenres
      .filter((sub): sub is string => typeof sub === 'string')
      .map(sub => sanitizeText(sub))
      .filter(sub => sub.length > 0);
  }
  
  // Фикс URL изображения
  if (sanitized.image && !isValidImageUrl(sanitized.image)) {
    sanitized.image = process.env.REACT_APP_FALLBACK_IMAGE || '/fallback-game.jpg';
  }
  
  // Генерация ID если нет
  if (!sanitized.id && sanitized.name) {
    sanitized.id = `game-${sanitized.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}`;
  }
  
  return sanitized;
};

/**
 * Фильтрация потенциально опасного контента
 */
export const filterMaliciousContent = (content: string): string => {
  const maliciousPatterns = [
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<script/gi,
    /<\/script>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi
  ];
  
  let filtered = content;
  maliciousPatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '[blocked]');
  });
  
  return filtered;
};
