import type { Context, Telegraf } from 'telegraf';
import { userRepo } from '../../../services/mongodb/repositories/user.repo.js';
import { logger } from '../../../utils/logger.js';

// Простая заглушка для списка городов/ресторанов (в продакшене — из Google Sheets)
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань'];
const RESTAURANTS: Record<string, string[]> = {
  Москва: ['Ресторан 1', 'Ресторан 2'],
  'Санкт-Петербург': ['Ресторан СПб 1'],
  Казань: ['Ресторан Казань 1'],
};

export const registerRegistrationHandlers = (bot: Telegraf<Context>) => {
  // Начало регистрации
  bot.hears('📝 Начать регистрацию', async (ctx) => {
    const user = ctx.state.user;
    if (!user) return;

    const cityKeyboard = CITIES.map((city) => [{ text: city }]);

    await ctx.reply('🌍 Шаг 1/2: Выберите ваш город:', {
      reply_markup: { keyboard: cityKeyboard, resize_keyboard: true, one_time_keyboard: true },
    });

    await userRepo.updateTempData(user.telegramId, { menuState: 'registration_city_select' });
  });

  // Выбор города
  bot.on('text', async (ctx) => {
    const user = ctx.state.user;
    const text = ctx.message?.text;
    if (!user || !text || user.temp?.menuState !== 'registration_city_select') return;

    if (!CITIES.includes(text)) {
      await ctx.reply('⚠️ Пожалуйста, выберите город из списка.');
      return;
    }

    await userRepo.updateTempData(user.telegramId, {
      ...user.temp,
      city: text,
      menuState: 'registration_restaurant_select',
    });

    const restaurants = RESTAURANTS[text] || [];
    const restaurantKeyboard = restaurants.map((r) => [{ text: r }]);

    await ctx.reply(`🏪 Шаг 2/2: Выберите ресторан в городе ${text}:`, {
      reply_markup: {
        keyboard: restaurantKeyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  });

  // Выбор ресторана и завершение регистрации
  bot.on('text', async (ctx) => {
    const user = ctx.state.user;
    const text = ctx.message?.text;
    if (!user || !text || user.temp?.menuState !== 'registration_restaurant_select') return;

    const { city } = user.temp;
    const restaurants = RESTAURANTS[city!] || [];

    if (!restaurants.includes(text)) {
      await ctx.reply('⚠️ Пожалуйста, выберите ресторан из списка.');
      return;
    }

    // Завершение регистрации
    await userRepo.updateStatus(user.telegramId, {
      city,
      restaurant: text,
      isApproved: false, // Требует одобрения админа
      temp: {},
    });

    await ctx.reply('✅ Данные сохранены! Ваша заявка отправлена на рассмотрение администратору.', {
      reply_markup: { remove_keyboard: true },
    });

    // Уведомление админа
    const adminId = Number(process.env.ADMIN_TELEGRAM_ID);
    if (adminId) {
      await bot.telegram.sendMessage(
        adminId,
        `🔔 Новая заявка:\n${user.fullName} (@${user.username})\n📍 ${city} / ${text}`,
        { parse_mode: 'Markdown' }
      );
    }

    logger.info('User registered', { userId: user.telegramId, city, restaurant: text });
  });
};
