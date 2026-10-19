import { useState } from 'react';

import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { hideControls, setControlsTypes } from 'storybook/controls';

import { Button, Placeholder, Section } from 'components';
import { List } from 'components/Blocks/List/List';
import { MultiselectOption } from 'components/Form/Multiselect/types';
import { Multiselect, MultiselectProps } from './Multiselect';

const meta = {
  title: 'Form/Multiselect',
  component: Multiselect,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    ...hideControls('options', 'before', 'renderOption', 'value', 'defaultValue', 'filterFn', 'creatable'),
    ...setControlsTypes(['header'], 'text'),
  },
} satisfies Meta<typeof Multiselect>;

export default meta;

const PLATFORM_OPTIONS: MultiselectOption[] = [
  { value: 'mac', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
  { value: 'other', label: 'Other' },
];

const decorator: Decorator = (Story) => (
  <List style={{ background: 'var(--tgui--secondary_bg_color)', minHeight: 360, width: 400, maxWidth: '100%', margin: 'auto' }}>
    <Story />
  </List>
);

const StoryBookComponent = (props: MultiselectProps & { sectionHeader: string }) => {
  const [value, setValue] = useState<MultiselectOption[]>([]);
  const { sectionHeader, ...multiselectProps } = props;

  return (
    <Section header={sectionHeader}>
      <Multiselect
        header="Platforms"
        {...multiselectProps}
        placeholder="Select platform"
        options={PLATFORM_OPTIONS}
        value={value}
        onChange={(newOptions) => setValue(newOptions)}
      />
    </Section>
  );
};

export const Pick: StoryObj<MultiselectProps> = {
  render: (props) => <StoryBookComponent sectionHeader="Pick from existed options" {...props} />,
  decorators: [decorator],
};

export const PickAndHideDropdown: StoryObj<MultiselectProps> = {
  args: {
    closeDropdownAfterSelect: true,
  },
  render: (props) => <StoryBookComponent sectionHeader="Pick from existed options and hide" {...props} />,
  decorators: [decorator],
};

export const CreateOptionInInput: StoryObj<MultiselectProps> = {
  args: {
    creatable: 'Create new platform',
  },
  render: (props) => <StoryBookComponent sectionHeader="Type something inside and press enter or option in list" {...props} />,
  decorators: [decorator],
};

const changeInput = async (input: HTMLInputElement, nextValue: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, nextValue);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise((resolve) => { setTimeout(resolve, 0); });
};

const expectInputValue = (input: HTMLInputElement, expected: string) => {
  if (input.value !== expected) {
    throw new Error(`Expected input value "${expected}", received "${input.value}"`);
  }
};

const ControlledInputExample = (props: MultiselectProps) => {
  const [inputValue, setInputValue] = useState('mac');

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '16px 22px 0' }}>
        <Button size="s" onClick={() => setInputValue('linux')}>Set Linux</Button>
        <Button size="s" mode="bezeled" onClick={() => setInputValue('')}>Clear input</Button>
      </div>
      <StoryBookComponent
        {...props}
        sectionHeader="Controlled input"
        inputValue={inputValue}
        onInputChange={(event) => setInputValue(event.currentTarget.value)}
      />
    </>
  );
};

export const ControlledInput: StoryObj<MultiselectProps> = {
  render: (props) => <ControlledInputExample {...props} />,
  decorators: [decorator],
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')!;
    const buttons = canvasElement.querySelectorAll('button');
    expectInputValue(input, 'mac');

    await changeInput(input, 'lin');
    expectInputValue(input, 'lin');

    buttons[0].click();
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    expectInputValue(input, 'linux');

    buttons[1].click();
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    expectInputValue(input, '');
  },
};

export const FixedInput: StoryObj<MultiselectProps> = {
  args: {
    inputValue: 'mac',
  },
  render: (props) => <StoryBookComponent sectionHeader="Fixed input value" {...props} />,
  decorators: [decorator],
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')!;
    expectInputValue(input, 'mac');
    await changeInput(input, 'linux');
    expectInputValue(input, 'mac');
  },
};

export const UncontrolledInput: StoryObj<MultiselectProps> = {
  render: (props) => <StoryBookComponent sectionHeader="Uncontrolled input" {...props} />,
  decorators: [decorator],
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')!;
    expectInputValue(input, '');
    await changeInput(input, 'lin');
    expectInputValue(input, 'lin');
  },
};

const ScrollableOptionsExample = (props: MultiselectProps) => {
  const [value, setValue] = useState<MultiselectOption[]>([]);

  return (
    <List style={{
      width: 400,
      maxWidth: '100%',
      minHeight: 'max(360px, calc(100vh - 32px))',
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'var(--tgui--secondary_bg_color)',
    }}>
      <Placeholder
        header="Scrollable options"
        description="Open the field near the bottom of the page, then scroll its options."
      />
      <Section header="Platforms" footer="Scroll the options or use the arrow keys to choose the last platform.">
        <Multiselect
          {...props}
          header="Supported platforms"
          aria-label="Scrollable platforms"
          placeholder="Select platforms"
          options={PLATFORM_OPTIONS}
          value={value}
          onChange={setValue}
        />
      </Section>
    </List>
  );
};

export const ScrollableOptions: StoryObj<MultiselectProps> = {
  render: (props) => <ScrollableOptionsExample {...props} />,
  parameters: {
    docs: {
      description: {
        story: 'The field sits near the bottom of the canvas so the dropdown can open upwards. Scroll through the options using a mouse wheel, touch, or arrow keys.',
      },
    },
  },
};
