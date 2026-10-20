import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { hideControls, setControlsTypes } from 'storybook/controls';

import { Avatar } from 'components/Blocks/Avatar/Avatar';
import { Badge } from 'components/Blocks/Badge/Badge';
import { Info } from 'components/Blocks/Cell/components/Info/Info';
import { List } from 'components/Blocks/List/List';
import { Section } from 'components/Blocks/Section/Section';
import { Input } from 'components/Form/Input/Input';
import { Cell } from './Cell';

const meta = {
  title: 'Blocks/Cell',
  component: Cell,
  argTypes: {
    ...hideControls('before', 'after', 'titleBadge'),
    ...setControlsTypes(['Component', 'subhead', 'subtitle', 'children', 'hint', 'description'], 'text'),
  },
} satisfies Meta<typeof Cell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    subhead: 'Subhead',
    children: 'Title',
    subtitle: 'Subtitle',
    description: 'Description',
    titleBadge: <Badge type="dot" />,
    before: <Avatar size={48} />,
    after: <Badge type="number">99</Badge>,
  },
} satisfies Story;

export const CellWithInfo: Story = {
  args: {
    children: 'Noah',
    subtitle: 'Yesterday',
    before: <Avatar size={48} />,
    after: <Info type="text" subtitle="Received">+1000</Info>,
  },
};

export const WithNativeDateInput: Story = {
  args: {
    subhead: 'Date',
  },
  render: (args, context) => (
    <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
      <Section header="Appointment" footer="Choose an appointment date.">
        <Cell {...args}>
          <input
            type="date"
            aria-label="Date"
            style={{
              font: 'inherit',
              color: 'inherit',
              background: 'transparent',
              border: 0,
              padding: 0,
              minHeight: 32,
              maxWidth: '100%',
              colorScheme: context.globals.theme === 'dark' ? 'dark' : 'light',
            }}
          />
        </Cell>
      </Section>
    </List>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A native date input inside Cell, using the library typography and theme. It remains statically positioned to cover ripple hit-testing regression #39.',
      },
    },
  },
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector('input');
    if (!input) {
      throw new Error('The native date input must be rendered');
    }

    const { left, top, width, height } = input.getBoundingClientRect();
    const target = input.ownerDocument.elementFromPoint(left + width / 2, top + height / 2);
    if (!input.contains(target)) {
      throw new Error('The native date input must receive pointer events without a ripple overlay intercepting them');
    }
  },
};

export const WithInput: Story = {
  args: {
    subtitle: 'Typing keeps the focus',
    description: 'Controlled Input inside Cell',
  },
  render: (args) => {
    const [value, setValue] = useState('');

    return (
      <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
        <Section header="Profile">
          <Cell {...args}>
            <Input
              header="Name"
              placeholder="Enter your name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </Cell>
        </Section>
      </List>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'A controlled Input inside Cell keeps focus, selection and its DOM node while typing and when the platform changes (e.g. after hydration), see issue #22.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input');
    if (!input) {
      throw new Error('The Input must be rendered');
    }

    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, 'Hello');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    if (canvasElement.querySelector('input') !== input || input.ownerDocument.activeElement !== input || input.value !== 'Hello') {
      throw new Error('The Input must keep its DOM node, value and focus after typing');
    }
  },
};
