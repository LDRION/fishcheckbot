/**
 * Производственные нормативы для расчёта актов
 * @see {@link https://internal-docs.mybox.ru/fish-norms}
 */
export const PRODUCTION_NORMS = {
  SLICES_SUSHI_MIN: 53.73, // Мин. % слайсов+суши от чистого веса
  RED_TRIM_MAX: 28.48, // Макс. % красной обрези
  BLACK_TRIM_MAX: 17.79, // Макс. % чёрной обрези
  WASTE_MAX: 14, // Макс. % отходов от веса по этикетке
} as const;

export const TELEGRAM_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 4096,
  POLLING_TIMEOUT_MS: 30_000,
} as const;

export const APP_CONSTANTS = {
  DEFAULT_LOG_LEVEL: 'info' as const,
  MONGODB_DEFAULT_URI: 'mongodb://localhost:27017/fishcheckbot',
} as const;
