import type { ActInput } from '../../models/types/index.js';

export interface ValidationResult {
  valid: boolean;
  value?: number;
  error?: string;
}

/**
 * Парсинг и валидация числового ввода от пользователя
 *
 * @param input - Строка от пользователя (может содержать запятую как разделитель)
 * @returns Результат валидации с числовым значением или ошибкой
 */
export const parseNumericInput = (input: string): ValidationResult => {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Введите числовое значение' };
  }

  // Нормализация: запятая → точка, удаление пробелов
  const sanitized = input.replace(',', '.').trim();

  // Проверка формата: не более одной точки, не заканчивается на точку
  if (sanitized.includes('.') && sanitized.split('.').length > 2) {
    return { valid: false, error: 'Неверный формат числа' };
  }
  if (sanitized.endsWith('.')) {
    return { valid: false, error: 'Число не может заканчиваться на точку' };
  }

  const value = parseFloat(sanitized);

  if (isNaN(value)) {
    return { valid: false, error: 'Введите корректное число' };
  }
  if (value < 0) {
    return { valid: false, error: 'Значение не может быть отрицательным' };
  }
  // Ограничение на 2 знака после запятой (для кг)
  if (sanitized.includes('.') && sanitized.split('.')[1]?.length > 2) {
    return { valid: false, error: 'Максимум 2 знака после запятой' };
  }

  return { valid: true, value };
};

/**
 * Контекстная валидация шага заполнения акта
 *
 * @param value - Проверенное числовое значение
 * @param step - Текущий шаг (1-4)
 * @param context - Данные предыдущих шагов
 * @returns Результат валидации с учётом бизнес-правил
 */
export const validateActStep = (
  value: number,
  step: number,
  context: Partial<ActInput>
): ValidationResult => {
  switch (step) {
    case 1: // Вес по этикетке
      if (value <= 0) {
        return { valid: false, error: 'Вес должен быть больше нуля' };
      }
      return { valid: true, value };

    case 2: // Слайсы + суши
      if (value > (context.weightEtiketka ?? 0)) {
        return {
          valid: false,
          error: `Не может превышать вес по этикетке (${context.weightEtiketka} кг)`,
        };
      }
      return { valid: true, value };

    case 3: // Красная обрезь
      const currentTotalWithRed = (context.slicesSushi ?? 0) + value;
      if (currentTotalWithRed > (context.weightEtiketka ?? 0)) {
        return {
          valid: false,
          error: `Сумма фракций (${currentTotalWithRed.toFixed(3)} кг) превышает вес по этикетке`,
        };
      }
      return { valid: true, value };

    case 4: // Чёрная обрезь
      const currentTotalWithBlack = (context.slicesSushi ?? 0) + (context.redTrim ?? 0) + value;
      if (currentTotalWithBlack > (context.weightEtiketka ?? 0)) {
        return {
          valid: false,
          error: `Общая сумма фракций превышает вес по этикетке`,
        };
      }
      return { valid: true, value };

    default:
      return { valid: false, error: 'Неизвестный шаг валидации' };
  }
};
