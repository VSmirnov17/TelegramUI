'use client';

import captionStyles from 'components/Typography/Caption/Caption.module.css';
import subheadlineStyles from 'components/Typography/Subheadline/Subheadline.module.css';
import textStyles from 'components/Typography/Text/Text.module.css';

import { classNames } from 'helpers/classNames';
import { usePlatform } from 'hooks/usePlatform';

import { Typography, TypographyProps } from 'components/Typography/Typography';

/*
 * Title and description are module-level components that only swap the platform class.
 * A component created per platform (or a different typography component per platform)
 * would remount the whole Cell content, including form fields, when the platform changes.
 */

export const CellTitle = ({ className, ...restProps }: TypographyProps) => {
  const platform = usePlatform();

  return (
    <Typography
      {...restProps}
      className={classNames(
        platform === 'ios' ? textStyles.wrapper : subheadlineStyles['wrapper--1'],
        className,
      )}
    />
  );
};

export const CellDescription = ({ className, ...restProps }: TypographyProps) => {
  const platform = usePlatform();

  return (
    <Typography
      {...restProps}
      className={classNames(
        platform === 'ios' ? captionStyles['wrapper--1'] : subheadlineStyles['wrapper--2'],
        className,
      )}
    />
  );
};
