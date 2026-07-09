import { Markup } from 'telegraf';
import type { UserDocument } from '../../models/User.js';

export const getMainMenuKeyboard = (
  user: UserDocument | null
): ReturnType<typeof Markup.keyboard> => {
  if (!user) {
    return Markup.keyboard(['📝 Начать регистрацию']).resize().oneTime();
  }
  if (user.isAdmin) {
    return Markup.keyboard([
      ['➕ Администрирование сотрудников'],
      ['⚙️ Настройка параметров рыбы'],
    ]).resize();
  }
  if (!user.isApproved) {
    return Markup.keyboard(['📝 Начать регистрацию']).resize();
  }
  return Markup.keyboard([['📝 Заполнить акт разбора'], ['🔄 Изменить ресторан']]).resize();
};

export const getFishTypeKeyboard = (
  fishTypes: string[]
): ReturnType<typeof Markup.inlineKeyboard> => {
  const buttons = fishTypes.map((fish) => Markup.button.callback(fish, `act_fish_select:${fish}`));
  buttons.push(Markup.button.callback('❌ Отмена', 'cancel_act'));
  return Markup.inlineKeyboard(buttons, { columns: 1 });
};
