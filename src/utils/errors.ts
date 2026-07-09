/**
 * Базовый класс для кастомных ошибок приложения
 * Позволяет добавлять контекст и код ошибки для логирования
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации пользовательского ввода
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
    this.name = 'ValidationError';
  }
}

/**
 * Ошибка авторизации/доступа
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, unknown>) {
    super(message, 403, true, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Ошибка "не найдено"
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404, true, { resource, id });
    this.name = 'NotFoundError';
  }
}

/**
 * Ошибка внешней интеграции (Google Sheets, Telegram API)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(`${service} error: ${message}`, 502, false, { service, ...context });
    this.name = 'ExternalServiceError';
  }
}
