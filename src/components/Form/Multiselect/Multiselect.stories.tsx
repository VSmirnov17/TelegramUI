import { useState } from 'react';

import { Decorator, Meta, StoryObj } from '@storybook/react';
import { hideControls, setControlsTypes } from 'storybook/controls';

import { Section } from 'components';
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
  <List style={{ background: 'var(--tgui--secondary_bg_color)', minHeight: '360px' }}>
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
      <button type="button" onClick={() => setInputValue('linux')}>Set Linux</button>
      <button type="button" onClick={() => setInputValue('')}>Clear input</button>
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
