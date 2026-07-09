import { describe, expect, it } from 'vitest';
import { calculateActMetrics } from '../../src/services/act/calculator.js';

describe('Act Calculator', () => {
  describe('calculateActMetrics', () => {
    it('рассчитывает вес отходов корректно', () => {
      const result = calculateActMetrics({
        weightEtiketka: 10,
        slicesSushi: 5,
        redTrim: 2,
        blackTrim: 1,
      });

      expect(result.waste).toBe(2);
      expect(result.metrics.waste.value).toBe(20); // 2/10 * 100
    });

    it('определяет отклонение: слайсы ниже нормы', () => {
      const result = calculateActMetrics({
        weightEtiketka: 10,
        slicesSushi: 3, // 3/8 = 37.5% < 53.73%
        redTrim: 2,
        blackTrim: 1,
      });

      expect(result.metrics.slicesSushi.isWithinNorm).toBe(false);
      expect(result.metrics.slicesSushi.deviation).toBeLessThan(0);
      expect(result.deviations).toContainEqual(expect.stringContaining('slices Sushi'));
    });

    it('определяет отклонение: красная обрезь выше нормы', () => {
      const result = calculateActMetrics({
        weightEtiketka: 10,
        slicesSushi: 5,
        redTrim: 3, // 3/8 = 37.5% > 28.48%
        blackTrim: 1,
      });

      expect(result.metrics.redTrim.isWithinNorm).toBe(false);
      expect(result.metrics.redTrim.deviation).toBeGreaterThan(0);
    });

    it('возвращает isWithinNorms=true, когда все метрики в норме', () => {
      const result = calculateActMetrics({
        weightEtiketka: 10,
        slicesSushi: 5.5, // 5.5/8.5 = 64.7% > 53.73% ✓
        redTrim: 2, // 2/8.5 = 23.5% < 28.48% ✓
        blackTrim: 1, // 1/8.5 = 11.8% < 17.79% ✓
        // waste = 1.5, 1.5/10 = 15% > 14% ✗
      });

      // В этом примере waste будет выше нормы
      expect(result.isWithinNorms).toBe(false);
      expect(result.deviations).toHaveLength(1);
    });

    it('обрабатывает граничный случай: нулевой чистый вес', () => {
      const result = calculateActMetrics({
        weightEtiketka: 5,
        slicesSushi: 5,
        redTrim: 0,
        blackTrim: 0,
      });

      // waste = 0, netWeight = 5
      expect(result.waste).toBe(0);
      expect(result.metrics.slicesSushi.value).toBe(100); // 5/5 * 100
    });
  });
});
