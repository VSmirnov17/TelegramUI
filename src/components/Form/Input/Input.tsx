'use client';

import { CSSProperties, forwardRef, InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

import { classNames } from 'helpers/classNames';
import { usePlatform } from 'hooks/usePlatform';

import { FormInputText } from 'components/Form/FormInput/components/FormInputText';
import { FormInput, FormPublicProps } from 'components/Form/FormInput/FormInput';

export interface InputProps extends FormPublicProps, InputHTMLAttributes<HTMLInputElement> {
  /** Styles for the whole form container, including its background, header, and icon areas. Use `style` for the native input. */
  rootStyle?: CSSProperties;
}

/**
 * Renders a text input field with enhanced styling and integration into a form structure. Supports customization through `FormPublicProps` and standard input attributes.
 * It automatically adapts typography and layout based on the platform, ensuring a consistent user experience across devices.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  header,
  before,
  after,
  status,
  className,
  disabled,
  rootStyle,
  ...restProps
}, ref) => {
  const platform = usePlatform();

  return (
    <FormInput
      header={header}
      before={before}
      after={after}
      status={status}
      disabled={disabled}
      rootStyle={rootStyle}
      className={classNames(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        className,
      )}
    >
      <FormInputText
        ref={ref}
        Component="input"
        className={styles.input}
        type={type}
        disabled={disabled}
        {...restProps}
      />
    </FormInput>
  );
});
