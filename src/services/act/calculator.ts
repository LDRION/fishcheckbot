import { PRODUCTION_NORMS } from '../../config/constants.js';
import type { ActInput, ActMetrics, Metric } from '../../models/types/index.js';
export type { ActInput } from '../../models/types/index.js';

/**
 * Расчёт метрик акта и проверка соответствия нормативам
 *
 * @param input - Данные из формы заполнения акта
 * @returns Объект с рассчитанными метриками и статусом соответствия нормам
 *
 * @example
 * ```ts
 * const result = calculateActMetrics({
 *   weightEtiketka: 10,
 *   slicesSushi: 5.5,
 *   redTrim: 2.1,
 *   blackTrim: 1.2
 * });
 * // result.isWithinNorms => false (если есть отклонения)
 * ```
 */
export const calculateActMetrics = (input: ActInput): ActMetrics => {
  const { weightEtiketka, slicesSushi, redTrim, blackTrim } = input;

  // Базовые расчёты
  const totalFractions = slicesSushi + redTrim + blackTrim;
  const waste = weightEtiketka - totalFractions;
  const netWeight = weightEtiketka - waste; // "Чистый" вес для расчёта процентов

  // Вспомогательная функция для расчёта метрики
  const calculateMetric = (
    value: number,
    denominator: number,
    norm: number,
    type: 'min' | 'max'
  ): Metric => {
    const percentage = denominator > 0 ? (value / denominator) * 100 : 0;
    const isWithinNorm = type === 'min' ? percentage >= norm : percentage <= norm;

    return {
      value: percentage,
      norm,
      type,
      isWithinNorm,
      deviation: isWithinNorm ? 0 : percentage - norm,
    };
  };

  // Расчёт всех метрик
  const metrics = {
    slicesSushi: calculateMetric(slicesSushi, netWeight, PRODUCTION_NORMS.SLICES_SUSHI_MIN, 'min'),
    redTrim: calculateMetric(redTrim, netWeight, PRODUCTION_NORMS.RED_TRIM_MAX, 'max'),
    blackTrim: calculateMetric(blackTrim, netWeight, PRODUCTION_NORMS.BLACK_TRIM_MAX, 'max'),
    waste: calculateMetric(waste, weightEtiketka, PRODUCTION_NORMS.WASTE_MAX, 'max'),
  };

  // Проверка: все ли метрики в норме
  const isWithinNorms = Object.values(metrics).every((m) => m.isWithinNorm);

  // Формирование списка отклонений для отображения пользователю
  const deviations = Object.entries(metrics)
    .filter(([, m]) => !m.isWithinNorm)
    .map(([key, m]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const sign = m.type === 'min' ? 'ниже' : 'выше';
      return `${label}: ${m.value.toFixed(2)}% (${sign} нормы на ${Math.abs(m.deviation!).toFixed(2)}%)`;
    });

  return {
    waste,
    metrics,
    isWithinNorms,
    deviations,
  };
};
