'use client';

import { forwardRef, HTMLAttributes } from 'react';
import styles from './AppRoot.module.css';

import { classNames } from 'helpers/classNames';
import { multipleRef } from 'helpers/react/refs';
import { useObjectMemo } from 'hooks/useObjectMemo';

import { AppRootContext, AppRootContextInterface } from 'components/Service/AppRoot/AppRootContext';
import { useAppearance } from 'components/Service/AppRoot/hooks/useAppearance';
import { usePlatform } from './hooks/usePlatform';
import { usePortalContainer } from './hooks/usePortalContainer';

export interface AppRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Application platform. Auto-detection uses base during SSR/hydration, then reads Telegram on the client. */
  platform?: AppRootContextInterface['platform'];
  /** Application appearance. Auto-detection uses light during SSR/hydration, then follows Telegram or the browser theme. */
  appearance?: AppRootContextInterface['appearance'];
  /** Rewriting portal container for rendering, AppRoot container as default */
  portalContainer?: AppRootContextInterface['portalContainer'];
}

export const AppRoot = forwardRef<HTMLDivElement, AppRootProps>(({
  platform: platformProp,
  appearance: appearanceProp,
  portalContainer: portalContainerProp,
  children,
  className,
  ...restProps
}, ref) => {
  const appearance = useAppearance(appearanceProp);
  const portalContainer = usePortalContainer(portalContainerProp);
  const platform = usePlatform(platformProp);

  const contextValue = useObjectMemo({
    platform,
    appearance,
    portalContainer,
    isRendered: true,
  });

  return (
    <div
      ref={multipleRef(ref, portalContainer)}
      className={classNames(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        appearance === 'dark' && styles['wrapper--dark'],
        className,
      )}
      {...restProps}
    >
      <AppRootContext.Provider value={contextValue}>
        {children}
      </AppRootContext.Provider>
    </div>
  );
});
