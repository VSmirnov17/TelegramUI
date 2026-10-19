import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { List } from 'components/Blocks/List/List';
import { Section } from 'components/Blocks/Section/Section';
import { Select, SelectProps } from './Select';

const meta = {
  title: 'Form/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    header: {
      description: 'Field label: floating on base, displayed above the field on iOS.',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;

export const Playground: StoryObj<SelectProps> = {
  render: () => (
    <List style={{
      width: 240,
      background: 'var(--tgui--secondary_bg_color)',
    }}>
      <Select header="Select" aria-label="Select">
        <option>Hello</option>
        <option>Okay</option>
      </Select>
    </List>
  ),
};

const WithHeaderExample = () => {
  const [device, setDevice] = useState('iphone');

  return (
    <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
      <Section footer={`Selected device: ${device === 'iphone' ? 'iPhone' : 'Windows'}`}>
        <Select header="Select your device" aria-label="Select your device" value={device} onChange={(event) => setDevice(event.target.value)}>
          <option value="iphone">iPhone</option>
          <option value="windows">Windows</option>
        </Select>
      </Section>
    </List>
  );
};

export const WithHeader: StoryObj<SelectProps> = {
  render: () => <WithHeaderExample />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'The header stays visible on both platforms: a floating label on base and a caption above the select on iOS. On iOS, the visible label is connected to the native select. Selection remains controlled by value and onChange.',
      },
      source: {
        code: `const [device, setDevice] = useState('iphone');

<Select header="Select your device" aria-label="Select your device" value={device} onChange={(event) => setDevice(event.target.value)}>
  <option value="iphone">iPhone</option>
  <option value="windows">Windows</option>
</Select>`,
      },
    },
  },
};

export const WithoutHeader: StoryObj<SelectProps> = {
  render: () => (
    <List style={{ width: 240, background: 'var(--tgui--secondary_bg_color)' }}>
      <Select aria-label="Device">
        <option>iPhone</option>
        <option>Windows</option>
      </Select>
    </List>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Omit header when the surrounding section already provides a visible title. Use aria-label or aria-labelledby to give the select an accessible name.',
      },
    },
  },
};
