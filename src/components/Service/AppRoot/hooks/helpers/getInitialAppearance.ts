import { canUseDOM } from 'helpers/dom';
import { getTelegramData } from 'helpers/telegram';

export const getInitialAppearance = () => {
  const telegramData = getTelegramData();
  if (telegramData) {
    return telegramData.colorScheme;
  }

  if (canUseDOM && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};
