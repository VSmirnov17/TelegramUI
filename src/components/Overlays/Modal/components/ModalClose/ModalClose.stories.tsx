import type { Meta, StoryObj } from '@storybook/react';

import { Placeholder } from 'components';
import { ModalClose, ModalCloseProps } from './ModalClose';

const meta = {
  title: 'Overlays/Modal/Modal.Close',
  component: ModalClose,
  parameters: {
    docs: {
      description: {
        component: [
          'Reuses its child element without adding a wrapper. The ref points to the actual HTML or SVG child.',
          'Custom components must forward that ref to their DOM element.',
          'Use a native button, such as Button, for keyboard activation and a button ref for programmatic click after async work.',
          'Put button-specific props such as disabled and type on the child. See Modal → Async Close for an uncontrolled example.',
        ].join(' '),
      },
    },
  },
} satisfies Meta<typeof ModalClose>;

export default meta;

export const Playground: StoryObj<ModalCloseProps> = {
  render: () => (
    <Placeholder
      description="This is a modal closer component. Wrap any component in Modal.Close and it will close after the click (or fire event onOpenChange if modal is controlled)"
    />
  ),
};
