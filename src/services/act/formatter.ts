import type { ActMetrics } from '../../models/types/index.js';
import { escapeMarkdown } from '../../utils/helpers.js';

export interface FormatActOptions {
  actNumber: number;
  city: string;
  restaurant: string;
  fishType: string;
  weightEtiketka: number;
  slicesSushi: number;
  redTrim: number;
  blackTrim: number;
  metrics: ActMetrics;
}

/**
 * Форматирование сообщения с результатами акта для Telegram (Markdown)
 *
 * @param options - Данные акта и рассчитанные метрики
 * @returns Отформатированная строка для отправки пользователю
 */
export const formatActMessage = (options: FormatActOptions): string => {
  const {
    actNumber,
    city,
    restaurant,
    fishType,
    weightEtiketka,
    slicesSushi,
    redTrim,
    blackTrim,
    metrics,
  } = options;

  const { waste, isWithinNorms, deviations } = metrics;

  // Заголовок
  let message = `*Акт № ${actNumber}*\n`;
  message += `📍 ${escapeMarkdown(city)}, ${escapeMarkdown(restaurant)}\n`;
  message += `🐟 ${escapeMarkdown(fishType)}\n\n`;

  // Таблица значений
  message += `📊 *Данные:*\n`;
  message += `• Вес по этикетке: *${weightEtiketka.toFixed(2)} кг*\n`;
  message += `• Слайсы + суши: *${slicesSushi.toFixed(2)} кг*\n`;
  message += `• Красная обрезь: *${redTrim.toFixed(2)} кг*\n`;
  message += `• Чёрная обрезь: *${blackTrim.toFixed(2)} кг*\n`;
  message += `• *Отходы (расчёт): ${waste.toFixed(3)} кг*\n\n`;

  // Статус соответствия нормам
  const statusIcon = isWithinNorms ? '✅' : '⚠️';
  const statusText = isWithinNorms
    ? 'Все показатели в пределах нормативов'
    : 'Обнаружены отклонения от нормативов:';

  message += `${statusIcon} *${statusText}*\n`;

  // Список отклонений (если есть)
  if (deviations.length > 0) {
    message += deviations.map((d) => `  • ${d}`).join('\n');
  }

  return message;
};

/**
 * Форматирование краткой сводки для уведомления админа
 */
export const formatAdminSummary = (
  options: Omit<FormatActOptions, 'metrics'> & {
    isWithinNorms: boolean;
    waste: number;
  }
): string => {
  const { actNumber, city, restaurant, fishType, weightEtiketka, waste, isWithinNorms } = options;

  const status = isWithinNorms ? '✅ В норме' : '⚠️ Отклонения';

  return (
    `*Акт #${actNumber}* | ${city}/${restaurant}\n` +
    `🐟 ${fishType} | 📦 ${weightEtiketka}кг → 🗑️ ${waste.toFixed(2)}кг | ${status}`
  );
};
