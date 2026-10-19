import styles from './Tooltip.module.css';

import { classNames } from 'helpers/classNames';

import { Popper, PopperProps } from 'components/Overlays/Popper/Popper';
import { Caption } from 'components/Typography/Caption/Caption';

export interface TooltipProps extends PopperProps {
  /** Defines the theme of the tooltip, affecting its background and text color. */
  mode?: 'light' | 'dark';
}

/**
 * Renders a text label positioned relative to targetRef using Popper.
 * The application controls visibility by conditionally rendering Tooltip and attaching
 * click, hover, or focus handlers to the target. Tooltip does not add these handlers itself.
 * Set role="tooltip" and an id, then reference that id with aria-describedby on the target.
 * Render inside AppRoot to inherit the library's styles, theme, and portal container.
 */
export const Tooltip = ({
  mode = 'light',
  children,
  className,
  arrowProps,
  ...restProps
}: TooltipProps) => (
  <Popper
    withArrow
    arrowProps={{
      ...arrowProps,
      className: classNames(
        styles.arrow,
        arrowProps?.className,
      ),
    }}
    className={classNames(
      styles.wrapper,
      mode === 'dark' && styles['wrapper--dark'],
      className,
    )}
    {...restProps}
  >
    <Caption level="1">{children}</Caption>
  </Popper>
);
