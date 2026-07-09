import type { Context, Telegraf } from 'telegraf';
import { actRepo } from '../../../services/mongodb/repositories/act.repo.js';
import { userRepo } from '../../../services/mongodb/repositories/user.repo.js';
import { logger } from '../../../utils/logger.js';

export const registerActActions = (bot: Telegraf<Context>) => {
  // Обработка кнопок "Отправить акт" / "Начать заново"
  bot.on('text', async (ctx) => {
    const user = ctx.state.user;
    const text = ctx.message?.text;

    if (!user?.temp?.menuState || user.temp.menuState !== 'filling_act_results' || !text) return;

    if (text === '✅ Отправить акт') {
      try {
        const { fishType, actNumber, data } = user.temp;

        // Сохранение акта в БД
        await actRepo.create({
          actNumber,
          telegramId: user.telegramId,
          city: user.city!,
          restaurant: user.restaurant!,
          fishType,
          ...data,
          division: 'Default', // TODO: получить из Google Sheets
          timestamp: new Date(),
        });

        await ctx.reply('✅ Акт успешно сохранён!', { reply_markup: { remove_keyboard: true } });
        logger.info('Act saved', { actNumber, userId: user.telegramId });
      } catch (error) {
        logger.error('Failed to save act', { error, userId: user.telegramId });
        await ctx.reply('❌ Ошибка при сохранении акта. Попробуйте позже.');
      }
    } else if (text === '🔄 Начать заново') {
      await ctx.reply('Готов к новому акту. Выберите рыбу.', {
        reply_markup: { remove_keyboard: true },
      });
    }

    // Сброс состояния
    await userRepo.updateTempData(user.telegramId, {});
  });
};
