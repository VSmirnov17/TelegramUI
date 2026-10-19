'use client';

import { useContext, useSyncExternalStore } from 'react';

import { getTelegramData } from 'helpers/telegram';

import { AppRootContext, AppRootContextInterface } from '../AppRootContext';
import { getBrowserAppearanceSubscriber } from './helpers/getBrowserAppearanceSubscriber';
import { getInitialAppearance } from './helpers/getInitialAppearance';

const getServerSnapshot = () => 'light' as const;
const noSubscription = () => () => {};

const subscribe = (onChange: () => void) => {
  const telegramData = getTelegramData();
  if (telegramData) {
    telegramData.onEvent('themeChanged', onChange);
    return () => telegramData.offEvent('themeChanged', onChange);
  }

  return getBrowserAppearanceSubscriber(onChange);
};

export const useAppearance = (appearanceProp?: AppRootContextInterface['appearance']): NonNullable<AppRootContextInterface['appearance']> => {
  const { appearance: contextAppearance } = useContext(AppRootContext);
  const controlledAppearance = appearanceProp ?? contextAppearance;
  const appearance = useSyncExternalStore(
    controlledAppearance === undefined ? subscribe : noSubscription,
    getInitialAppearance,
    getServerSnapshot,
  );

  return controlledAppearance ?? appearance;
};
