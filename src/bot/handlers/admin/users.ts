import type { Context, Telegraf } from 'telegraf';
import { userRepo } from '../../../services/mongodb/repositories/user.repo.js';
import { logger } from '../../../utils/logger.js';

export const registerAdminUserHandlers = (bot: Telegraf<Context>) => {
  // Список пользователей, ожидающих подтверждения
  bot.hears('⏳ Ожидают подтверждения', async (ctx) => {
    const users = await userRepo.findMany({ isApproved: false, isAdmin: false });

    if (users.length === 0) {
      await ctx.reply('📭 Нет заявок на подтверждение.');
      return;
    }

    const message = users
      .map(
        (u) =>
          `• ${u.fullName} (@${u.username || 'no-username'})\n  📍 ${u.city || '?'} / ${u.restaurant || '?'}`
      )
      .join('\n');

    await ctx.reply(`*Заявки (${users.length}):*\n\n${message}`, { parse_mode: 'Markdown' });
  });

  // Одобрение пользователя (по команде /approve <telegram_id>)
  bot.command('approve', async (ctx) => {
    const telegramId = ctx.message?.text.split(' ')[1];
    if (!telegramId || isNaN(Number(telegramId))) {
      await ctx.reply('Использование: /approve <telegram_id>');
      return;
    }

    try {
      await userRepo.updateStatus(Number(telegramId), { isApproved: true });
      await ctx.reply(`✅ Пользователь ${telegramId} одобрен.`);
      await bot.telegram.sendMessage(
        Number(telegramId),
        '🎉 Ваша заявка одобрена! Теперь вы можете пользоваться ботом.'
      );
      logger.info('User approved', { approvedBy: ctx.from?.id, userId: telegramId });
    } catch (error) {
      logger.error('Failed to approve user', { error, telegramId });
      await ctx.reply('❌ Ошибка при одобрении пользователя.');
    }
  });
};
