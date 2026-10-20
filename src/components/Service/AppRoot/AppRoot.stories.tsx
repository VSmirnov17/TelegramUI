import { CSSProperties, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Icon28Chat } from 'icons/28/chat';
import { Icon28Devices } from 'icons/28/devices';
import { hideControls } from 'storybook/controls';

import { Avatar, Button, Caption, Cell, List, Navigation, Section, SegmentedControl, Title } from 'components';
import { AppRoot, AppRootProps } from './AppRoot';

const meta = {
  title: 'Service/AppRoot',
  component: AppRoot,
  argTypes: hideControls('children', 'portalContainer', 'style'),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'Wrap your app in AppRoot to provide platform, appearance, and portal context.',
          'Telegram CSS variables supply theme colors; library defaults apply when those variables are absent.',
          'Set ignoreTelegramTheme to use the library palette for the selected appearance even inside Telegram.',
          'Nested AppRoot components inherit this option; pass false to restore Telegram colors. Inline --tgui--* overrides still apply.',
          'Automatic detection uses base/light during server rendering and hydration, then reads Telegram or the browser theme.',
          'Pass the same explicit platform and appearance on the server and client to render the desired variant immediately.',
          'Use the toolbar to switch Platform and Theme, then compare the palettes below.',
        ].join(' '),
      },
    },
  },
} satisfies Meta<typeof AppRoot>;

export default meta;
type Story = StoryObj<typeof meta>;
type Palette = 'Inherited' | 'Telegram' | 'Custom';

const PALETTES = {
  Telegram: {
    light: { background: '#ffffff', secondary: '#eff1f4', text: '#18222d', hint: '#707579', accent: '#2481cc' },
    dark: { background: '#17212b', secondary: '#232e3c', text: '#ffffff', hint: '#a8b5c3', accent: '#6ab2f2' },
  },
  Custom: {
    light: { background: '#fff8f2', secondary: '#f1e3d8', text: '#39271c', hint: '#876f5f', accent: '#a85b27' },
    dark: { background: '#281d32', secondary: '#392943', text: '#f8efff', hint: '#bca7d0', accent: '#c39aef' },
  },
};

const ThemePreview = ({ initialPalette = 'Inherited', opposingPalette = false, ...props }: AppRootProps & { initialPalette?: Palette; opposingPalette?: boolean }) => {
  const [palette, setPalette] = useState<Palette>(initialPalette);
  const [view, setView] = useState('Week');
  const [ignoreTelegramTheme, setIgnoreTelegramTheme] = useState(true);
  const requestedAppearance = props.appearance === 'dark' ? 'dark' : 'light';
  const oppositeAppearance = requestedAppearance === 'dark' ? 'light' : 'dark';
  const incomingAppearance = opposingPalette ? oppositeAppearance : requestedAppearance;
  const colors = palette === 'Inherited' ? undefined : PALETTES[palette][incomingAppearance];
  const themeStyle = colors ? {
    '--tg-theme-bg-color': colors.background,
    '--tg-theme-secondary-bg-color': colors.secondary,
    '--tg-theme-section-bg-color': colors.background,
    '--tg-theme-header-bg-color': colors.background,
    '--tg-theme-text-color': colors.text,
    '--tg-theme-hint-color': colors.hint,
    '--tg-theme-subtitle-text-color': colors.hint,
    '--tg-theme-section-header-text-color': colors.hint,
    '--tg-theme-button-color': colors.accent,
    '--tg-theme-button-text-color': colors.background,
    '--tg-theme-link-color': colors.accent,
    '--tg-theme-accent-text-color': colors.accent,
  } as CSSProperties : {};

  return (
    <AppRoot {...props} ignoreTelegramTheme={opposingPalette ? ignoreTelegramTheme : props.ignoreTelegramTheme} style={{ ...themeStyle, ...props.style }}>
      <List style={{ width: 480, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
        <div style={{ padding: 16 }}>
          <Title level="3" weight="2">Theme colors</Title>
          <Caption Component="p" style={{ color: 'var(--tgui--hint_color)', margin: '8px 0 16px' }}>
            {opposingPalette
              ? `Incoming Telegram colors are ${incomingAppearance}; requested appearance is ${props.appearance}. Toggle library colors to compare.`
              : 'Compare inherited colors with two sample Telegram palettes.'}
          </Caption>
          {opposingPalette && (
            <Button
              size="s"
              aria-pressed={ignoreTelegramTheme}
              mode={ignoreTelegramTheme ? 'filled' : 'gray'}
              onClick={() => setIgnoreTelegramTheme(!ignoreTelegramTheme)}
              style={{ marginBottom: 8 }}
            >
              Use library colors
            </Button>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['Inherited', 'Telegram', 'Custom'] as const).map((name) => (
              <Button
                key={name}
                size="s"
                mode={palette === name ? 'filled' : 'gray'}
                aria-pressed={palette === name}
                onClick={() => setPalette(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
        <Section header="Profile" footer="Compare the avatar placeholder and highlighted row with the segmented control below.">
          <Cell
            before={<Avatar size={48} fallbackIcon={<Icon28Chat />} aria-label="Avatar placeholder" />}
            after={<Navigation />}
            subtitle="Avatar placeholder"
          >
            Chat settings
          </Cell>
          <Cell hovered before={<Icon28Devices />} after={<Navigation />} subtitle="Highlighted row">
            Connected devices
          </Cell>
        </Section>
        <div style={{ padding: 16 }}>
          <SegmentedControl aria-label="Period">
            {['Day', 'Week', 'Month'].map((label) => (
              <SegmentedControl.Item key={label} selected={view === label} onClick={() => setView(label)}>
                {label}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
          <Caption Component="p" style={{ color: 'var(--tgui--hint_color)', marginTop: 12 }}>
            Switch palettes to compare the track with the selected segment.
          </Caption>
          <Caption Component="p" role="status" style={{ color: 'var(--tgui--hint_color)', marginTop: 12 }}>
            {palette} palette · {props.appearance}{opposingPalette && ` · ${ignoreTelegramTheme ? 'Library colors' : 'Telegram colors'}`}
          </Caption>
        </div>
      </List>
    </AppRoot>
  );
};

export const Playground: Story = {
  render: (args, { globals }) => (
    <ThemePreview {...args} appearance={args.appearance ?? globals.theme} platform={args.platform ?? globals.platform} />
  ),
  parameters: {
    docs: {
      source: {
        code: `import '@telegram-apps/telegram-ui/dist/styles.css';
import { AppRoot, Cell, List, Section } from '@telegram-apps/telegram-ui';

<AppRoot>
  <List>
    <Section header="Settings">
      <Cell>Chat settings</Cell>
    </Section>
  </List>
</AppRoot>`,
      },
    },
  },
};

export const TelegramTheme: Story = {
  render: (args, { globals }) => (
    <ThemePreview {...args} initialPalette="Telegram" appearance={args.appearance ?? globals.theme} platform={args.platform ?? globals.platform} />
  ),
  parameters: {
    docs: {
      description: {
        story: [
          'This preview supplies Telegram CSS variables locally. In a Mini App, Telegram supplies these values.',
          'Switch to Custom to check another palette without changing the library tokens.',
        ].join(' '),
      },
    },
  },
};

export const ForcedAppearance: Story = {
  argTypes: hideControls('ignoreTelegramTheme'),
  render: (args, { globals }) => (
    <ThemePreview {...args} initialPalette="Telegram" opposingPalette appearance={args.appearance ?? globals.theme} platform={args.platform ?? globals.platform} />
  ),
  parameters: {
    docs: {
      description: {
        story: [
          'The incoming Telegram palette deliberately opposes the requested appearance.',
          'Toggle the color source, then switch the toolbar Theme to compare forced light and dark palettes.',
          'The Telegram CSS variables remain available to other consumers.',
        ].join(' '),
      },
      source: {
        code: `<AppRoot appearance="light" ignoreTelegramTheme>
  <MyApp />
</AppRoot>`,
      },
    },
  },
};
