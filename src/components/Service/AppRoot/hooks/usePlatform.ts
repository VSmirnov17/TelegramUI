import { useContext, useSyncExternalStore } from 'react';

import { AppRootContext, AppRootContextInterface } from '../AppRootContext';
import { getInitialPlatform } from './helpers/getInitialPlatform';

const subscribe = () => () => {};
const getServerSnapshot = () => 'base' as const;

export const usePlatform = (platform?: AppRootContextInterface['platform']): NonNullable<AppRootContextInterface['platform']> => {
  const appContext = useContext(AppRootContext);
  const detectedPlatform = useSyncExternalStore(subscribe, getInitialPlatform, getServerSnapshot);

  return platform ?? (appContext.isRendered ? appContext.platform : undefined) ?? detectedPlatform;
};
