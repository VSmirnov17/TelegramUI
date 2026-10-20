import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { hideControls } from 'storybook/controls';

import { SegmentedControl, SegmentedControlProps } from './SegmentedControl';

const meta = {
  title: 'Navigation/SegmentedControl',
  component: SegmentedControl,
  argTypes: hideControls('children'),
  parameters: {
    docs: {
      source: {
        transform: (code: string) => code.replace(/(<\/?)SegmentedControlItem(?=[\s/>])/g, '$1SegmentedControl.Item'),
      },
      description: {
        component: [
          'SegmentedControl inherits its appearance and colors from AppRoot. Wrap your app in AppRoot so it can follow Telegram or the browser theme.',
          'Automatic detection starts with base/light during server rendering and hydration, then updates on the client.',
          'If your server already knows the appearance, pass the same value on the server and client.',
          'The track and selected segment use the AppRoot surface tokens, which follow Telegram CSS colors when available.',
          'To force a library palette regardless of Telegram colors, set `appearance="dark"` and `ignoreTelegramTheme` on `AppRoot`.',
        ].join(' '),
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

const labels = [
  {
    label: 'Label',
    value: 'label',
  },
  {
    label: 'Label 2',
    value: 'label2',
  },
  {
    label: 'Label 3',
    value: 'label3',
  },
];

export const Playground: StoryObj<SegmentedControlProps> = {
  render: (args) => {
    const [selected, setSelected] = useState(labels[0].value);

    return (
      <SegmentedControl {...args}>
        {labels.map(({ value, label }) => (
          <SegmentedControl.Item
            key={value}
            selected={selected === value}
            onClick={() => setSelected(value)}
          >
            {label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>
    );
  },
  decorators: [
    (Component) => (
      <div style={{ width: 500, maxWidth: '100%' }}>
        <Component />
      </div>
    ),
  ],
};

