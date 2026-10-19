import { useRef, useState } from 'react';

import { Decorator, Meta, StoryObj } from '@storybook/react';
import { Icon28Close } from 'icons/28/close';
import { hideControls } from 'storybook/controls';

import { AppRoot, Button, List, Multiselect, Placeholder, Section, Tooltip } from 'components';
import { MultiselectOption } from 'components/Form/Multiselect/types';
import { Modal, ModalProps } from './Modal';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  argTypes: hideControls('header', 'trigger', 'children', 'overlayComponent', 'snapPoints', 'fadeFromIndex'),
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

const DecoratorFullScreen: Decorator = (StoryComponent, { viewMode }) => (
  <>
    {viewMode === 'story' && (
      <div
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'var(--tgui--bg_color)' }}
      />
    )}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 600,
      maxHeight: '96vh',
    }}>
      <StoryComponent />
    </div>
  </>
);

export const Playground: Story = {
  args: {
    header: <Modal.Header>Only iOS header</Modal.Header>,
    trigger: <Button size="m">Open modal</Button>,
    children: (
      <Placeholder
        header="Title"
        description="Description"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
      </Placeholder>
    ),
  },
  decorators: [DecoratorFullScreen],
};

const PlaceholderForNestedModal = (props: ModalProps) => (
  <Placeholder
    header="Title"
    description="Description"
    action={<Modal {...props} nested><PlaceholderForNestedModal {...props} /></Modal>}
  />
);

export const NestedModals: Story = {
  args: Playground.args,
  render: (args) => (
    <Modal {...args}>
      <PlaceholderForNestedModal trigger={args.trigger} {...args} />
    </Modal>
  ),
  decorators: [DecoratorFullScreen],
};

export const WithCloseButton: Story = {
  args: {
    ...Playground.args,
    header: (
      <Modal.Header after={<Modal.Close><Icon28Close style={{ color: 'var(--tgui--plain_foreground)' }} /></Modal.Close>}>
        Only iOS header
      </Modal.Header>
    ),
  },
  decorators: [DecoratorFullScreen],
};

export const SnapPoints: Story = {
  args: {
    ...Playground.args,
    snapPoints: [0.33, 0.66, 1],
    children: (
      <>
        <div style={{ height: '33vh', background: 'blue' }} />
        <div style={{ height: '33vh', background: 'green' }} />
        <div style={{ height: '33vh', background: 'bisque' }} />
      </>
    ),
  },
  decorators: [DecoratorFullScreen],
};

export const Controlled: Story = {
  args: {
    ...Playground.args,
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.open);
    const [isFetching, setIsFetching] = useState(false);

    const fetchAndClose = () => {
      setIsFetching(true);
      setTimeout(() => {
        setIsFetching(false);
        setIsOpen(false);
      }, 1000);
    };

    return (
      <Placeholder
        header="This modal will be closed after 1000ms, click fetch"
        description="Click fetch"
        action={<Button size="m" onClick={() => setIsOpen(true)}>Open again</Button>}
      >
        <Modal
          {...args}
          trigger={undefined}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <Placeholder action={(
            <Button
              size="m"
              loading={isFetching}
              onClick={fetchAndClose}
            >
              Fetch data and close
            </Button>
          )} />
        </Modal>
      </Placeholder>
    );
  },
  decorators: [DecoratorFullScreen],
};

const MultiselectInModal = ({ nested, ...props }: ModalProps) => {
  const [value, setValue] = useState<MultiselectOption[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      {...props}
      nested={nested}
      aria-label={nested ? 'Nested platform form' : 'Platform form'}
      trigger={<Button size="m">{nested ? 'Open nested form' : 'Open platform form'}</Button>}
      header={(
        <Modal.Header after={<Modal.Close><Button size="s" mode="plain">Close</Button></Modal.Close>}>
          Choose platforms
        </Modal.Header>
      )}
    >
      <List style={{ width: 480, maxWidth: '100%', minHeight: 360, margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
        <Section header="Platforms" footer="Choose one or more platforms, then press Done.">
          <Multiselect
            aria-label="Modal platforms"
            header="Supported platforms"
            placeholder="Select platforms"
            options={[
              { value: 'mac', label: 'macOS' },
              { value: 'linux', label: 'Linux' },
              { value: 'windows', label: 'Windows' },
              { value: 'ios', label: 'iOS' },
              { value: 'android', label: 'Android' },
              { value: 'web', label: 'Web' },
            ]}
            value={value}
            onChange={setValue}
          />
        </Section>
        <div style={{ padding: 16 }}>
          <Button ref={helpRef} size="s" mode="plain" onClick={() => setShowHelp((shown) => !shown)}>Help</Button>
          {showHelp && <Tooltip role="tooltip" targetRef={helpRef}>Choose every platform your app supports.</Tooltip>}
          <Modal.Close><Button stretched>Done</Button></Modal.Close>
        </div>
      </List>
    </Modal>
  );
};

export const WithMultiselect: Story = {
  render: (args) => <MultiselectInModal {...args} />,
  decorators: [DecoratorFullScreen],
};

export const NestedWithMultiselect: Story = {
  render: () => (
    <Modal aria-label="Parent modal" trigger={<Button>Open parent modal</Button>}>
      <Placeholder
        header="Platform settings"
        description="Open the nested form to select supported platforms."
        action={<MultiselectInModal nested />}
      />
    </Modal>
  ),
  decorators: [DecoratorFullScreen],
};

const CustomPortalExample = (props: ModalProps) => {
  const portalContainer = useRef<HTMLDivElement>(null);

  return (
    <AppRoot portalContainer={portalContainer}>
      <MultiselectInModal {...props} />
      <div ref={portalContainer} />
    </AppRoot>
  );
};

export const MultiselectWithCustomPortal: Story = {
  render: (args) => <CustomPortalExample {...args} />,
  decorators: [DecoratorFullScreen],
};
