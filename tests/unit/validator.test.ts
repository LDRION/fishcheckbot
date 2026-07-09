import { describe, expect, it } from 'vitest';
import { parseNumericInput, validateActStep } from '../../src/services/act/validator.js';

describe('Act Validator', () => {
  describe('parseNumericInput', () => {
    it.each([
      ['5.25', 5.25],
      ['5,25', 5.25], // Запятая как разделитель
      ['  3.14  ', 3.14], // Пробелы
      ['0', 0], // Ноль допустим
    ])('парсит корректный ввод "%s" → %d', (input, expected) => {
      const result = parseNumericInput(input);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(expected);
    });

    it.each([
      ['abc', 'Введите корректное число'],
      ['-5', 'не может быть отрицательным'],
      ['1.2.3', 'Неверный формат'],
      ['5.', 'не может заканчиваться на точку'],
      ['', 'Введите числовое значение'],
    ])('отклоняет некорректный ввод "%s"', (input, expectedError) => {
      const result = parseNumericInput(input);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(expectedError);
    });
  });

  describe('validateActStep', () => {
    it('шаг 1: принимает положительный вес', () => {
      const result = validateActStep(10, 1, {});
      expect(result.valid).toBe(true);
    });

    it('шаг 1: отклоняет ноль или отрицательное', () => {
      expect(validateActStep(0, 1, {}).valid).toBe(false);
      expect(validateActStep(-1, 1, {}).valid).toBe(false);
    });

    it('шаг 2: отклоняет значение больше веса по этикетке', () => {
      const result = validateActStep(15, 2, { weightEtiketka: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('этикетке');
    });

    it('шаг 3: проверяет сумму с предыдущими фракциями', () => {
      const result = validateActStep(8, 3, {
        weightEtiketka: 10,
        slicesSushi: 5,
      });
      // 5 + 8 = 13 > 10 → ошибка
      expect(result.valid).toBe(false);
    });
  });
});
