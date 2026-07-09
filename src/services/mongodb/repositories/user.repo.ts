import { User, UserDocument } from '../../../models/User.js';
import { logger } from '../../../utils/logger.js';

export const userRepo = {
  /**
   * Найти пользователя по Telegram ID
   */
  findByTelegramId: async (telegramId: number): Promise<UserDocument | null> => {
    return User.findOne({ telegramId }).lean();
  },

  /**
   * Создать или найти пользователя (Upsert)
   */
  upsertByTelegramId: async (
    telegramId: number,
    data: Partial<UserDocument>
  ): Promise<UserDocument> => {
    const user = await User.findOneAndUpdate(
      { telegramId },
      { $set: { ...data, telegramId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    logger.info('User upserted', { telegramId, isNew: !data.fullName });
    return user;
  },

  /**
   * Обновить временные данные пользователя (состояние бота)
   */
  updateTempData: async (telegramId: number, temp: Record<string, unknown>): Promise<void> => {
    await User.updateOne({ telegramId }, { $set: { temp } });
  },

  /**
   * Найти пользователей по фильтру (для админки)
   */
  findMany: async (filter: Record<string, unknown>): Promise<UserDocument[]> => {
    return User.find(filter).sort({ createdAt: -1 }).lean();
  },

  /**
   * Обновить статус пользователя
   */
  updateStatus: async (telegramId: number, statusUpdate: Partial<UserDocument>): Promise<void> => {
    await User.updateOne({ telegramId }, { $set: statusUpdate });
    logger.info('User status updated', { telegramId, ...statusUpdate });
  },
};
