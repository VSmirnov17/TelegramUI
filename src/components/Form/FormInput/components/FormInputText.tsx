'use client';

import { forwardRef } from 'react';
import subheadlineStyles from 'components/Typography/Subheadline/Subheadline.module.css';
import textStyles from 'components/Typography/Text/Text.module.css';

import { classNames } from 'helpers/classNames';
import { usePlatform } from 'hooks/usePlatform';

import { Typography, TypographyProps } from 'components/Typography/Typography';

/**
 * Typography of a native form field: `Text` on iOS and `Subheadline` on base.
 * Only the platform class changes, so switching the platform (e.g. after hydration)
 * keeps the same component type and does not remount the native field or lose its focus.
 */
export const FormInputText = forwardRef(({ className, ...restProps }: TypographyProps, ref) => {
  const platform = usePlatform();

  return (
    <Typography
      ref={ref}
      {...restProps}
      className={classNames(
        platform === 'ios' ? textStyles.wrapper : subheadlineStyles['wrapper--1'],
        className,
      )}
    />
  );
});
