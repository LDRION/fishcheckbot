import type { Context, Telegraf } from 'telegraf';
import { calculateActMetrics } from '../../../services/act/calculator.js';
import { formatActMessage } from '../../../services/act/formatter.js';
import { parseNumericInput, validateActStep } from '../../../services/act/validator.js';
import { actRepo } from '../../../services/mongodb/repositories/act.repo.js';
import { userRepo } from '../../../services/mongodb/repositories/user.repo.js';
import { logger } from '../../../utils/logger.js';

export const registerActHandlers = (bot: Telegraf<Context>) => {
  // Начало заполнения акта (выбор рыбы через inline-кнопку)
  bot.action(/^act_fish_select:(.+)$/, async (ctx) => {
    const fishType = ctx.match[1];
    const user = ctx.state.user;

    if (!user?.isApproved) {
      await ctx.answerCbQuery('Ваш аккаунт ещё не одобрен', { show_alert: true });
      return;
    }

    try {
      const actNumber = await actRepo.getNextActNumber(user.city!);

      // ✅ Исправлено: добавлен ключ data
      await userRepo.updateTempData(user.telegramId, {
        fillingAct: true,
        fishType,
        actNumber,
        step: 1,
        data: {},
        menuState: 'filling_act_input_weight_etiketka',
      });

      await ctx.deleteMessage().catch(() => {});
      await askActQuestion(ctx, user);

      logger.info('Started act filling', { userId: user.telegramId, actNumber, fishType });
    } catch (error) {
      logger.error('Failed to start act filling', { error, userId: user.telegramId });
      await ctx.reply('❌ Произошла ошибка. Попробуйте начать заново.');
    }
  });

  // Обработка текстового ввода в процессе заполнения акта
  bot.on('text', async (ctx) => {
    const user = ctx.state.user;
    const text = ctx.message?.text;

    if (!user?.temp?.fillingAct || !text) return;
    if (user.temp.menuState && !String(user.temp.menuState).startsWith('filling_act_input_'))
      return;

    if (text === '❌ Отмена') {
      await userRepo.updateTempData(user.telegramId, {});
      await ctx.reply('Заполнение акта отменено.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    const { step, data } = user.temp;

    const parseResult = parseNumericInput(text);
    if (!parseResult.valid) {
      await ctx.reply(`⚠️ ${parseResult.error}. Попробуйте ещё раз.`, {
        reply_markup: { keyboard: [[{ text: '❌ Отмена' }]], resize_keyboard: true },
      });
      return;
    }

    const validateResult = validateActStep(parseResult.value!, step, data);
    if (!validateResult.valid) {
      await ctx.reply(`⚠️ ${validateResult.error}. Введите значение заново.`, {
        reply_markup: { keyboard: [[{ text: '❌ Отмена' }]], resize_keyboard: true },
      });
      return;
    }

    const fieldMap: Record<number, keyof typeof data> = {
      1: 'weightEtiketka',
      2: 'slicesSushi',
      3: 'redTrim',
      4: 'blackTrim',
    };

    const updatedData = { ...data, [fieldMap[step]]: parseResult.value };

    if (step < 4) {
      await userRepo.updateTempData(user.telegramId, {
        ...user.temp,
        data: updatedData,
        step: step + 1,
      });
      await askActQuestion(ctx, {
        ...user,
        temp: { ...user.temp, data: updatedData, step: step + 1 },
      });
    } else {
      await showActResults(ctx, { ...user, temp: { ...user.temp, data: updatedData } });
    }
  });
};

const askActQuestion = async (ctx: Context, user: any) => {
  const { step, data, actNumber } = user.temp;

  const questions: Record<number, string> = {
    1: `*Акт № ${actNumber}*\n1/4: Введите *Вес филе по этикетке, кг*`,
    2: `*Акт № ${actNumber}*\n2/4: Вес по этикетке: *${data.weightEtiketka}*\nВведите *Слайсы + суши, кг*`,
    3: `*Акт № ${actNumber}*\n3/4: Слайсы+Суши: *${data.slicesSushi}*\nВведите *Красная обрезь, кг*`,
    4: `*Акт № ${actNumber}*\n4/4: Красная обрезь: *${data.redTrim}*\nВведите *Черная обрезь, кг*`,
  };

  await ctx.reply(questions[step], {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [[{ text: '❌ Отмена' }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showActResults = async (ctx: Context, user: any) => {
  const { fishType, actNumber, data } = user.temp;

  const metrics = calculateActMetrics(data);
  const message = formatActMessage({
    actNumber,
    city: user.city!,
    restaurant: user.restaurant!,
    fishType,
    ...data,
    metrics,
  });

  // ✅ Исправлено: добавлен ключ data
  await userRepo.updateTempData(user.telegramId, {
    ...user.temp,
    data: { ...data, waste: metrics.waste, calculatedWaste: metrics.waste },
    menuState: 'filling_act_results',
  });

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [[{ text: '✅ Отправить акт' }], [{ text: '🔄 Начать заново' }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};
