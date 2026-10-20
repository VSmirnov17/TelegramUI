'use client';

import { forwardRef, ReactNode, SelectHTMLAttributes, useId } from 'react';
import styles from './Select.module.css';

import { classNames } from 'helpers/classNames';
import { hasReactNode } from 'helpers/react/node';
import { usePlatform } from 'hooks/usePlatform';

import { Icon20ChevronDown } from 'icons/20/chevron_down';

import { FormInputText } from 'components/Form/FormInput/components/FormInputText';
import { FormInputTitle } from 'components/Form/FormInput/components/FormInputTitle';
import { FormInput, FormPublicProps } from 'components/Form/FormInput/FormInput';

export interface SelectProps extends Omit<FormPublicProps, 'after'>, SelectHTMLAttributes<HTMLSelectElement> {
  /** Field label: floating on base, displayed above the field on iOS. */
  header?: ReactNode;
  /** Children elements, typically `option` elements to be rendered within the select. */
  children: ReactNode;
}

/**
 * Renders a custom styled select input within a `FormInput` container. This component is designed to integrate seamlessly
 * with the form input styles, providing a consistent look and enhanced features such as a custom dropdown arrow and support
 * for platform-specific typography. The `FormInput` wrapper facilitates the inclusion of headers and status messages.
 * The `header` prop is a floating label on `base` and a label above the field on iOS.
 */
export const Select = forwardRef<HTMLInputElement, SelectProps>(({
  header,
  before,
  status,
  className,
  id,
  ...restProps
}, ref) => {
  const platform = usePlatform();
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const select = (
    <FormInput
      header={header}
      before={before}
      status={status}
      className={classNames(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        className,
      )}
    >
      <FormInputText
        Component="select"
        id={selectId}
        className={styles.select}
        multiple={false}
        ref={ref}
        {...restProps}
      />
      <Icon20ChevronDown aria-hidden className={styles.chevron} />
    </FormInput>
  );

  if (platform === 'ios' && hasReactNode(header)) {
    return (
      <div>
        <FormInputTitle Component="label" htmlFor={selectId} className={styles.title}>
          {header}
        </FormInputTitle>
        {select}
      </div>
    );
  }

  return select;
});
