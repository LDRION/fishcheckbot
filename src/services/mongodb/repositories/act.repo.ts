import { Act, ActDocument } from '../../../models/Act.js';
import { logger } from '../../../utils/logger.js';

export const actRepo = {
  /**
   * Создать новую запись акта
   */
  create: async (
    data: Omit<ActDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ActDocument> => {
    const act = new Act(data);
    await act.save();
    logger.info('Act created', { actNumber: act.actNumber, city: act.city });
    return act.toObject();
  },

  /**
   * Получить следующий номер акта для города
   * (Находит максимальный номер и возвращает +1)
   */
  getNextActNumber: async (city: string): Promise<number> => {
    const lastAct = await Act.findOne({ city }).sort({ actNumber: -1 }).select('actNumber').lean();

    return lastAct ? lastAct.actNumber + 1 : 1;
  },

  /**
   * Найти акты пользователя
   */
  findByUser: async (telegramId: number, limit: number = 10): Promise<ActDocument[]> => {
    return Act.find({ telegramId }).sort({ createdAt: -1 }).limit(limit).lean();
  },
};
