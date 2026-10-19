import type { Meta, StoryObj } from '@storybook/react';
import { hideControls, setControlsTypes } from 'storybook/controls';

import { Avatar } from 'components/Blocks/Avatar/Avatar';
import { Badge } from 'components/Blocks/Badge/Badge';
import { Info } from 'components/Blocks/Cell/components/Info/Info';
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
    children: <input type="date" aria-label="Date" />,
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
