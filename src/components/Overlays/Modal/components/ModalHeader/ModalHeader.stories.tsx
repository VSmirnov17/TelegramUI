import type { Meta, StoryObj } from '@storybook/react';
import { hideControls } from 'storybook/controls';

import { Placeholder } from 'components';
import { ModalHeader, ModalHeaderProps } from './ModalHeader';

const meta = {
  title: 'Overlays/Modal/Modal.Header',
  component: ModalHeader,
  parameters: {
    docs: {
      source: {
        transform: (code: string) => code.replace(/(<\/?)ModalHeader(?=[\s/>])/g, '$1Modal.Header'),
      },
    },
  },
  argTypes: hideControls('children', 'before', 'after'),
} satisfies Meta<typeof ModalHeader>;

export default meta;

export const Playground: StoryObj<ModalHeaderProps> = {
  args: {
    children: 'Only iOS header',
  },
  render: (args) => (
    <Placeholder description="This is a modal header. If you want to see the text title, change the platform to iOS">
      <ModalHeader {...args} />
    </Placeholder>
  ),
};
