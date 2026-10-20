import { forwardRef, HTMLAttributes, ReactNode, useContext } from 'react';
import styles from './ModalHeader.module.css';

import { classNames } from 'helpers/classNames';
import { hasReactNode } from 'helpers/react/node';
import { usePlatform } from 'hooks/usePlatform';

import { Drawer } from 'vaul';

import { VisuallyHidden } from 'components/Service/VisuallyHidden/VisuallyHidden';
import { Text } from 'components/Typography/Text/Text';
import { ModalContext } from '../../ModalContext';

export interface ModalHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Inserts a component before the header text, e.g. Icon */
  before?: ReactNode;
  /** Inserts a component after the header text, e.g. Icon */
  after?: ReactNode;
}

/**
 * Header children name the containing Modal. The title is visible on iOS and visually
 * hidden on base. Supply title text here; use Modal.Title instead for custom layouts.
 */
export const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(({
  before,
  after,
  className,
  children,
  ...props
}, ref) => {
  const platform = usePlatform();
  const insideModal = useContext(ModalContext);
  let title = platform === 'ios' ? <Text weight="2" className={styles.children}>{children}</Text> : null;

  if (insideModal && hasReactNode(children)) {
    title = platform === 'ios' ? (
      <Drawer.Title asChild><Text Component="h2" weight="2" className={styles.children}>{children}</Text></Drawer.Title>
    ) : (
      <VisuallyHidden><Drawer.Title>{children}</Drawer.Title></VisuallyHidden>
    );
  }

  return (
    <header
      ref={ref}
      className={classNames(styles.wrapper, className)}
      {...props}
    >
      <div className={styles.before}>
        {before}
      </div>
      {title}
      <div className={styles.after}>
        {after}
      </div>
    </header>
  );
});
