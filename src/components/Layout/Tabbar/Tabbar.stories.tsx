import { useEffect, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Icon28Chat } from 'icons/28/chat';
import { Icon28Devices } from 'icons/28/devices';
import { Icon28Stats } from 'icons/28/stats';
import { hideControls } from 'storybook/controls';

import { Button, Cell, Info, List, Section, Switch } from 'components';
import { Tabbar, TabbarProps } from './Tabbar';

const meta = {
  title: 'Layout/Tabbar',
  component: Tabbar,
  argTypes: hideControls('children'),
  parameters: {
    docs: {
      description: {
        component: 'A bottom navigation bar. Forward a ref to its root div to measure its full height, including bottom padding. Use ResizeObserver when that height can change.',
      },
    },
  },
} satisfies Meta<typeof Tabbar>;

export default meta;

const tabs = [
  {
    id: 0,
    Icon: Icon28Devices,
    text: 'Devices',
  },
  {
    id: 1,
    Icon: Icon28Chat,
    text: 'Chat',
  },
  {
    id: 2,
    Icon: Icon28Stats,
    text: 'Stats',
  },
];

export const Playground: StoryObj<TabbarProps> = {
  render: () => {
    const [currentTab, setCurrentTab] = useState(tabs[0].id);

    return (
      <Tabbar>
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={text}
            selected={id === currentTab}
            onClick={() => setCurrentTab(id)}
          >
            <Icon />
          </Tabbar.Item>
        ))}
      </Tabbar>
    );
  },
  decorators: [
    (Story) => (
      <div style={{ height: 100, transform: 'translateZ(0)', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

const MeasuredTabbar = () => {
  const tabbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [currentTab, setCurrentTab] = useState(tabs[0].id);

  useEffect(() => {
    const tabbar = tabbarRef.current;
    if (!tabbar) {
      return undefined;
    }

    const updateHeight = () => setHeight(tabbar.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(tabbar, { box: 'border-box' });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ height: 520, transform: 'translateZ(0)', overflow: 'hidden', background: 'var(--tgui--secondary_bg_color)' }}>
      <div ref={contentRef} style={{ height: '100%', overflowY: 'auto' }}>
        <List style={{ paddingBottom: height + 72 }}>
          <Section header="Navigation" footer="Toggle labels or switch Platform to change the panel height. The floating button stays 16px above it.">
            <Cell
              after={<Switch checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} aria-label="Show tab labels" />}
            >
              Show tab labels
            </Cell>
            <Cell after={<Info type="text">{height}px</Info>}>Panel height</Cell>
          </Section>
          <Section header={tabs[currentTab].text} footer="Scroll to the last row to check that content remains clear of the navigation bar.">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
              <Cell key={item} subtitle={`${tabs[currentTab].text} overview`}>Item {item}</Cell>
            ))}
          </Section>
        </List>
      </div>
      {height > 0 && (
        <Button
          size="s"
          style={{ position: 'fixed', right: 16, bottom: height + 16 }}
          onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top
        </Button>
      )}
      <Tabbar ref={tabbarRef} aria-label="Main navigation">
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={showLabels ? text : undefined}
            aria-label={text}
            aria-pressed={id === currentTab}
            selected={id === currentTab}
            onClick={() => setCurrentTab(id)}
          >
            <Icon />
          </Tabbar.Item>
        ))}
      </Tabbar>
    </div>
  );
};

export const MeasuredHeight: StoryObj<TabbarProps> = {
  render: () => <MeasuredTabbar />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: [
          'The ref points to the actual Tabbar div. ResizeObserver tracks platform, label, and padding changes.',
          'The measured border-box height positions the floating button and reserves space after the content.',
          'This preview is contained so it does not cover other documentation examples.',
        ].join(' '),
      },
      source: {
        code: `import { useEffect, useRef, useState } from 'react';
import '@telegram-apps/telegram-ui/dist/styles.css';
import { AppRoot, Button, Icon28Chat, Icon28Devices, Tabbar } from '@telegram-apps/telegram-ui';

function Page() {
  const tabbarRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [tab, setTab] = useState('devices');

  useEffect(() => {
    const element = tabbarRef.current;
    if (!element) return;
    const update = () => setHeight(element.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element, { box: 'border-box' });
    return () => observer.disconnect();
  }, []);

  return (
    <AppRoot>
      <main style={{ paddingBottom: height + 72 }}>
        {tab === 'devices' ? 'Your devices' : 'Your messages'}
      </main>
      {height > 0 && (
        <Button size="s" style={{ position: 'fixed', right: 16, bottom: height + 16 }}>
          Action
        </Button>
      )}
      <Tabbar ref={tabbarRef} aria-label="Main navigation">
        <Tabbar.Item text="Devices" selected={tab === 'devices'} onClick={() => setTab('devices')}>
          <Icon28Devices />
        </Tabbar.Item>
        <Tabbar.Item text="Chat" selected={tab === 'chat'} onClick={() => setTab('chat')}>
          <Icon28Chat />
        </Tabbar.Item>
      </Tabbar>
    </AppRoot>
  );
}`,
      },
    },
  },
};

