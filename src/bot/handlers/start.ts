import type { Context, Telegraf } from 'telegraf';
import { userRepo } from '../../services/mongodb/repositories/user.repo.js';
import { logger } from '../../utils/logger.js';

/**
 * Регистрирует обработчик команды /start
 */
export const registerStartHandler = (bot: Telegraf<Context>) => {
  bot.start(async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const firstName = ctx.from?.first_name || '';
    const lastName = ctx.from?.last_name || '';
    const username = ctx.from?.username;
    const fullName = `${firstName} ${lastName}`.trim() || username || 'Пользователь';

    try {
      // Создаём или обновляем пользователя
      const user = await userRepo.upsertByTelegramId(telegramId, {
        firstName,
        lastName,
        username,
        fullName,
        // Если это главный админ из .env — сразу одобряем
        isAdmin: telegramId === Number(process.env.ADMIN_TELEGRAM_ID),
        isApproved: telegramId === Number(process.env.ADMIN_TELEGRAM_ID),
      });

      // Формируем приветственное сообщение
      let message = `👋 Привет, ${fullName}!\n\n`;

      if (user.isAdmin) {
        message += '👑 *Вы администратор*\nДоступны команды управления.';
      } else if (user.isApproved) {
        message += `✅ *Вы зарегистрированы*\nГород: ${user.city || 'не указан'}\nРесторан: ${user.restaurant || 'не указан'}`;
      } else {
        message += '📝 *Для начала работы пройдите регистрацию*';
      }

      await ctx.reply(message, { parse_mode: 'Markdown' });

      logger.info('User started bot', { telegramId, fullName, isAdmin: user.isAdmin });
    } catch (error) {
      logger.error('Failed to handle /start', { telegramId, error });
      await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
    }
  });
};
