import type { Context } from 'telegraf';
import { logger } from '../../utils/logger.js';

type NextFn = () => Promise<void>;

export const logIncomingMessage = async (ctx: Context, next: NextFn) => {
  const message = ctx.message;
  if (!message) return next();

  const logData = {
    telegramId: ctx.from?.id,
    username: ctx.from?.username,
    chatType: ctx.chat?.type,
    messageType:
      'text' in message
        ? 'text'
        : Object.keys(message).find((k) => !['date', 'from', 'chat'].includes(k)),
    text: 'text' in message ? String(message.text).slice(0, 100) : undefined,
  };

  logger.info('← Incoming message', logData);
  const start = Date.now();
  await next();
  logger.debug('→ Message processed', { ...logData, durationMs: Date.now() - start });
};
