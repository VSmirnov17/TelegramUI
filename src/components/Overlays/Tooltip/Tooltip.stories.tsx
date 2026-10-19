import { useId, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { hideControls } from 'storybook/controls';

import { Button, Text } from 'components';
import { Tooltip, TooltipProps } from './Tooltip';

const clickExample = (mode: TooltipProps['mode']) => `'use client';

import { useId, useRef, useState } from 'react';
import { AppRoot, Button, Tooltip } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';

export default function TooltipExample() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [shown, setShown] = useState(true);

  return (
    <AppRoot>
      <Button
        ref={targetRef}
        aria-describedby={shown ? tooltipId : undefined}
        onClick={() => setShown((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setShown(false);
        }}
      >
        Toggle tooltip
      </Button>
      {shown && (
        <Tooltip id={tooltipId} role="tooltip" targetRef={targetRef} placement="top" mode="${mode}">
          Hold to record audio. Tap to switch to video.
        </Tooltip>
      )}
    </AppRoot>
  );
}`;

const hoverExample = `'use client';

import { useId, useRef, useState } from 'react';
import { AppRoot, Button, Tooltip } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';

export default function TooltipExample() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const shown = hovered || focused;

  return (
    <AppRoot>
      <Button
        ref={targetRef}
        aria-describedby={shown ? tooltipId : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setHovered(false);
            setFocused(false);
          }
        }}
      >
        Hover or focus me
      </Button>
      {shown && (
        <Tooltip id={tooltipId} role="tooltip" targetRef={targetRef} placement="top">
          Hold to record audio. Tap to switch to video.
        </Tooltip>
      )}
    </AppRoot>
  );
}`;

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  argTypes: hideControls('ArrowIcon', 'targetRef', 'arrowProps', 'Component', 'customMiddlewares', 'id', 'role'),
  args: {
    mode: 'light',
    placement: 'top',
    targetRef: { current: null },
    children: 'Hold to record audio. Tap to switch to video.',
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Tooltip positions content next to targetRef. It does not manage visibility or attach events to the target: use state and conditionally render it.',
          'Attach the same ref to your target element.',
          'Render inside AppRoot and import the library CSS once, as shown in the examples (if your app already has AppRoot, use the existing one).',
          'Add role="tooltip", an id, and aria-describedby on the target to associate the hint with its control.',
          'The mode prop selects the tooltip surface independently of the app theme.',
        ].join(' '),
      },
    },
  },
  decorators: [(StoryComponent) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      width: 'min(400px, calc(100vw - 32px))',
      maxWidth: '100%',
      minHeight: 300,
      padding: 24,
      boxSizing: 'border-box',
    }}>
      <StoryComponent />
    </div>
  )],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

const ClickExample = (args: TooltipProps) => {
  const targetRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [shown, setShown] = useState(true);

  return (
    <>
      <Button
        ref={targetRef}
        aria-describedby={shown ? tooltipId : undefined}
        onClick={() => setShown((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setShown(false);
          }
        }}
      >
        Toggle tooltip
      </Button>
      {shown && <Tooltip {...args} id={tooltipId} role="tooltip" targetRef={targetRef} />}
      <Text Component="p" style={{ textAlign: 'center', color: 'var(--tgui--hint_color)' }}>
        Click or tap the button to toggle the hint. Press Escape to dismiss it.
      </Text>
    </>
  );
};

export const Playground: Story = {
  render: (args) => <ClickExample {...args} />,
  parameters: {
    docs: {
      description: { story: 'Click, tap, Enter, or Space toggles visibility. Escape dismisses the tooltip. The application owns this state.' },
      source: { code: clickExample('light') },
    },
  },
};

export const Dark: Story = {
  ...Playground,
  args: { mode: 'dark' },
  parameters: {
    docs: {
      description: { story: 'Use mode="dark" for a dark tooltip surface. This is separate from the global Theme toolbar setting.' },
      source: { code: clickExample('dark') },
    },
  },
};

const HoverAndFocusExample = (args: TooltipProps) => {
  const targetRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const shown = hovered || focused;

  return (
    <>
      <Button
        ref={targetRef}
        aria-describedby={shown ? tooltipId : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') {
            setHovered(true);
          }
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setHovered(false);
            setFocused(false);
          }
        }}
      >
        Hover or focus me
      </Button>
      {shown && <Tooltip {...args} id={tooltipId} role="tooltip" targetRef={targetRef} />}
      <Text Component="p" style={{ textAlign: 'center', color: 'var(--tgui--hint_color)' }}>
        Hover over the button or focus it with Tab. Press Escape to dismiss the hint.
      </Text>
    </>
  );
};

export const HoverAndFocus: Story = {
  render: (args) => <HoverAndFocusExample {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'The hint stays visible while the button is hovered or focused. Escape dismisses it without moving focus. For an explicit touch toggle, use Playground.',
      },
      source: { code: hoverExample },
    },
  },
};

