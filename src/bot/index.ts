import 'dotenv/config'; // ← ПЕРВЫЙ ИМПОРТ!

import { Context, Telegraf } from 'telegraf';
import { env } from '../config/index.js';
import { connectDB } from '../services/mongodb/connection.js';
import { logger } from '../utils/logger.js';
import { registerActActions } from './handlers/act/actions.js';
import { registerActHandlers } from './handlers/act/flow.js';
import { registerAdminUserHandlers } from './handlers/admin/users.js';
import { registerRegistrationHandlers } from './handlers/registration/flow.js';
import { registerStartHandler } from './handlers/start.js';
import { loadUser } from './middleware/auth.js';
import { logIncomingMessage } from './middleware/logger.js';

// ✅ Явно указываем тип возврата функции
export const startBot = async (): Promise<Telegraf<Context>> => {
  try {
    await connectDB();
    const bot = new Telegraf(env.BOT_TOKEN);

    bot.use(logIncomingMessage);
    bot.use(loadUser);

    registerStartHandler(bot);
    registerActHandlers(bot);
    registerActActions(bot);
    registerAdminUserHandlers(bot);
    registerRegistrationHandlers(bot);

    // Обработка ошибок
    bot.catch((err, ctx) => {
      const error = err as Error;
      logger.error('Bot error', {
        error: error.message || String(error),
        updateType: ctx.updateType,
        userId: ctx.from?.id,
      });
    });

    await bot.launch({ dropPendingUpdates: true });
    logger.info('🚀 Bot launched', { username: (await bot.telegram.getMe()).username });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down...`);
      await bot.stop(signal);
      process.exit(0);
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

    return bot;
  } catch (error) {
    logger.error('❌ Failed to start bot', { error });
    process.exit(1);
  }
};

// Запуск, если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  startBot();
}
