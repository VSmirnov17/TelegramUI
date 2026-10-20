import { useId, useRef, useState } from 'react';

import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Icon28Close } from 'icons/28/close';
import { hideControls } from 'storybook/controls';

import { AppRoot, Button, List, Multiselect, Placeholder, Section, Text, Title, Tooltip } from 'components';
import { MultiselectOption } from 'components/Form/Multiselect/types';
import { Modal, ModalProps } from './Modal';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: {
    docs: {
      source: {
        // Generated source should show the public aliases of the underlying dialog primitives.
        transform: (code: string) => code
          .replace(/(<\/?)DialogTitle(?=[\s/>])/g, '$1Modal.Title')
          .replace(/(<\/?)DialogDescription(?=[\s/>])/g, '$1Modal.Description')
          .replace(/(<\/?)ModalHeader(?=[\s/>])/g, '$1Modal.Header')
          .replace(/(<\/?)ModalClose(?=[\s/>])/g, '$1Modal.Close'),
      },
      description: {
        component: [
          'Give every modal a meaningful title. Modal.Header children automatically name the dialog on both platforms;',
          'the text is visible on iOS and visually hidden on base. For a headerless or custom-header layout, render exactly one Modal.Title instead.',
          'Do not nest Modal.Title inside Modal.Header. Use asChild with library typography or an existing element to preserve its styling.',
          'Modal.Description optionally connects a short description to the dialog. For a visually hidden custom title, wrap Modal.Title in VisuallyHidden.',
        ].join(' '),
      },
    },
  },
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
    header: <Modal.Header>Telegram preview</Modal.Header>,
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
        Telegram preview
      </Modal.Header>
    ),
  },
  decorators: [DecoratorFullScreen],
};

export const SnapPoints: Story = {
  parameters: {
    // Snap offsets use the window height; keep the inline Docs containing block viewport-sized.
    docs: { story: { inline: true, height: '96vh' } },
  },
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
  const helpTooltipId = useId();

  return (
    <Modal
      {...props}
      nested={nested}
      trigger={<Button size="m">{nested ? 'Open nested form' : 'Open platform form'}</Button>}
      header={(
        <Modal.Header after={<Modal.Close><Button size="s" mode="plain">Close</Button></Modal.Close>}>
          {nested ? 'Choose nested platforms' : 'Choose platforms'}
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
          <Button
            ref={helpRef}
            aria-describedby={showHelp ? helpTooltipId : undefined}
            size="s"
            mode="plain"
            onClick={() => setShowHelp((shown) => !shown)}
          >
            Help
          </Button>
          {showHelp && (
            <Tooltip
              id={helpTooltipId}
              role="tooltip"
              targetRef={helpRef}
              placement="top-start"
              style={{ maxWidth: 'calc(100% - 32px)', boxSizing: 'border-box' }}
            >
              Choose every platform your app supports.
            </Tooltip>
          )}
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
    <Modal trigger={<Button>Open parent modal</Button>}>
      <Placeholder
        header={<Modal.Title asChild><span>Platform settings</span></Modal.Title>}
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

export const WithoutHeader: Story = {
  render: (args) => (
    <Modal {...args} trigger={<Button size="m">Open notification settings</Button>}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Modal.Title asChild><Title Component="h2" level="3" weight="2">Notification settings</Title></Modal.Title>
        <Modal.Description asChild>
          <Text Component="p">Manage notifications for this mini app.</Text>
        </Modal.Description>
        <Modal.Close><Button stretched>Done</Button></Modal.Close>
      </div>
    </Modal>
  ),
  decorators: [DecoratorFullScreen],
};
