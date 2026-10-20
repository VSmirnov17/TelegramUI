import { CSSProperties, useEffect, useRef, useState } from 'react';

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
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'A bottom navigation bar. Forward a ref to its root div to measure its full height, including bottom padding.',
          'Use ResizeObserver when that height can change.',
          'Bottom padding adds the device and Telegram content insets from bound CSS variables.',
          'For each inset, official Telegram variables take priority over SDK viewport aliases.',
          'Without either device variable, the library safe-area token supplies the native env() fallback.',
          'Keep your Telegram bridge or SDK CSS-variable binding active so updates reach CSS without reading a getter during render.',
          'Apply safe-area padding once: an inline paddingBottom overrides the automatic padding.',
        ].join(' '),
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
    (Story, { viewMode }) => (
      <div style={{ height: viewMode === 'docs' ? 100 : '100dvh', transform: 'translateZ(0)', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

const MeasuredTabbar = ({ fullscreen }: { fullscreen: boolean }) => {
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
    <div style={{ height: fullscreen ? '100dvh' : 520, transform: 'translateZ(0)', overflow: 'hidden', background: 'var(--tgui--secondary_bg_color)' }}>
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
  render: (_, { viewMode }) => <MeasuredTabbar fullscreen={viewMode !== 'docs'} />,
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

const SafeAreaTabbar = ({ fullscreen }: { fullscreen: boolean }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState(tabs[0].id);

  const setInset = (name: string, enabled: boolean) => {
    previewRef.current?.style.setProperty(name, enabled ? '34px' : '0px');
  };

  return (
    <div
      ref={previewRef}
      style={{
        '--tg-safe-area-inset-bottom': '34px',
        '--tg-content-safe-area-inset-bottom': '0px',
        height: fullscreen ? '100dvh' : 440,
        transform: 'translateZ(0)',
        overflow: 'hidden',
        background: 'var(--tgui--secondary_bg_color)',
      } as CSSProperties}
    >
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <List style={{ paddingBottom: 160 }}>
          <Section header="Safe area" footer="Toggle each inset to update the navigation padding. The tab bar stays mounted while CSS variables change.">
            <Cell
              after={(
                <Switch
                  defaultChecked
                  aria-label="Device bottom inset"
                  onChange={(event) => setInset('--tg-safe-area-inset-bottom', event.target.checked)}
                />
              )}
            >
              Device inset: 34px
            </Cell>
            <Cell
              after={(
                <Switch
                  aria-label="Telegram content bottom inset"
                  onChange={(event) => setInset('--tg-content-safe-area-inset-bottom', event.target.checked)}
                />
              )}
            >
              Content inset: 34px
            </Cell>
          </Section>
        </List>
      </div>
      <Tabbar aria-label="Safe area navigation">
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={text}
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

export const SafeArea: StoryObj<TabbarProps> = {
  render: (_, { viewMode }) => <SafeAreaTabbar fullscreen={viewMode !== 'docs'} />,
  parameters: {
    docs: {
      description: {
        story: [
          'This preview simulates Telegram CSS-variable updates using independent device and content inset switches.',
          'The device inset starts at 34px; switch it off and on to check the 34 → 0 → 34px transition.',
          'The official variables are --tg-safe-area-inset-bottom and --tg-content-safe-area-inset-bottom.',
          'SDK aliases --tg-viewport-safe-area-inset-bottom and --tg-viewport-content-safe-area-inset-bottom are used when official variables are absent.',
          'Each source is counted once. Explicit zero values are respected.',
          'This demonstrates CSS updates; it does not emulate a native keyboard or Telegram BackButton event.',
        ].join(' '),
      },
    },
  },
};

