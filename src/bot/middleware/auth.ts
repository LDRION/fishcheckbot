import type { Context } from 'telegraf';
import { userRepo } from '../../services/mongodb/repositories/user.repo.js';
import { logger } from '../../utils/logger.js';

type NextFn = () => Promise<void>;

export const loadUser = async (ctx: Context, next: NextFn) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return next();

  try {
    const user = await userRepo.findByTelegramId(telegramId);
    if (user) ctx.state.user = user;
    return next();
  } catch (error) {
    logger.error('Failed to load user', { telegramId, error });
    return next();
  }
};

export const requireApproved = async (ctx: Context, next: NextFn) => {
  const user = ctx.state.user;
  if (!user?.isApproved) {
    await ctx.reply('⏳ Ваша заявка ещё не одобрена администратором.');
    return;
  }
  return next();
};

export const requireAdmin = async (ctx: Context, next: NextFn) => {
  const user = ctx.state.user;
  if (!user?.isAdmin) {
    await ctx.reply('🔐 Доступ запрещён: требуется роль администратора.');
    return;
  }
  return next();
};
