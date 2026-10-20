import { forwardRef, HTMLAttributes, ReactNode, Ref, useMemo } from 'react';

import { multipleRef } from 'helpers/react/refs';

import { Drawer } from 'vaul';

export interface ModalCloseProps extends HTMLAttributes<Element> {
  /** The child element that receives the close behavior, props and ref. */
  children?: ReactNode;
}

/**
 * Reuses its child's DOM element as the close trigger; no wrapper is added.
 * The ref points to that element, which may be HTML or SVG. Use a native button
 * child for keyboard activation and a button ref whose click() can close after async work.
 * Put button-specific props such as disabled and type on that child.
 */
export const ModalClose = forwardRef<Element, ModalCloseProps>((props, ref) => {
  // Preserve cleanup-returning callbacks through the underlying slot's composed refs.
  const childRef = useMemo(() => (ref ? multipleRef(ref) : undefined), [ref]);

  return (
    // Vaul declares a button ref, but asChild forwards the actual child element (including SVG).
    <Drawer.Close asChild {...props} ref={childRef as Ref<HTMLButtonElement> | undefined} />
  );
});
