/**
 * Безопасное извлечение значения из вложенного объекта
 * @param obj - Исходный объект
 * @param path - Путь в формате 'a.b.c' или ['a', 'b', 'c']
 * @param defaultValue - Значение по умолчанию, если путь не найден
 */
export const getNestedValue = <T>(
  obj: Record<string, unknown>,
  path: string | string[],
  defaultValue?: T
): T | undefined => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }

  return result as T | undefined;
};

/**
 * Задержка выполнения (Promise-based sleep)
 * @param ms - Миллисекунды
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Форматирование числа с фиксированным количеством знаков после запятой
 * @param value - Число
 * @param decimals - Количество знаков (по умолчанию 2)
 */
export const formatNumber = (value: number, decimals: number = 2): string =>
  Number.isFinite(value) ? value.toFixed(decimals) : '0';

/**
 * Sanitization строки для безопасного вывода в Markdown
 * Экранирует спецсимволы Telegram Markdown v2
 */
export const escapeMarkdown = (text: string): string => {
  const chars = [
    '_',
    '*',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!',
  ];
  return text
    .split('')
    .map((char) => (chars.includes(char) ? `\\${char}` : char))
    .join('');
};
