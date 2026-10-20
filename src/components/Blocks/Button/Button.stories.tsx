import { CSSProperties } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Icon20Copy } from 'icons/20/copy';
import { Icon24PersonRemove } from 'icons/24/person_remove';
import { hideControls, setControlsTypes } from 'storybook/controls';

import { List, Section } from 'components';
import { Button, ButtonProps } from './Button';

const meta = {
  title: 'Blocks/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Button renders a native button by default. Set `Component` to use another element or component; its props, events and ref follow that target.',
          'Button still consumes its visual props, including `size` and `mode`. Custom components must forward remaining props and their ref to the intended element.',
          'Use `ButtonProps<typeof Link>` when declaring props for a Router Link override:',
          [
            '```tsx',
            'import { Link } from \'react-router-dom\';',
            'import { Button, type ButtonProps } from \'@telegram-apps/telegram-ui\';',
            '',
            'const route: ButtonProps<typeof Link> = { Component: Link, to: \'/route\' };',
            '',
            '<Button {...route}>Open route</Button>;',
            '```',
          ].join('\n'),
        ].join('\n\n'),
      },
    },
  },
  argTypes: {
    ...hideControls('before', 'after', 'Component'),
    ...setControlsTypes(['children'], 'text'),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  args: {
    size: 's',
    mode: 'filled',
    children: 'Action',
  },
} satisfies Story;

export const WithIcon: Story = {
  args: {
    size: 's',
    mode: 'filled',
    children: 'Create channel',
  },
  render: (args) => (
    <Button
      before={args.size === 's' ? <Icon20Copy /> : <Icon24PersonRemove />}
      {...args}
    />
  ),
} satisfies Story;

export const Link: StoryObj<ButtonProps<'a'>> = {
  args: {
    size: 's',
    mode: 'filled',
    children: 'No hello',
    target: '_blank',
    href: 'https://nohello.net/en/',
    Component: 'a',
  },
} satisfies StoryObj<ButtonProps<'a'>>;

export const BorderRadius: Story = {
  args: {
    size: 'm',
    mode: 'bezeled',
    children: 'Continue',
  },
  render: (args) => {
    const radius = `--tgui--button--border-radius--${args.size ?? 'm'}`;

    return (
      <List style={{ width: 480, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
        {[
          { title: 'Default corners', footer: 'Switch Platform and size to compare the library defaults.' },
          { title: 'Custom corners', footer: 'An 18px radius is scoped to this button and its background.', custom: true },
          { title: 'Disabled', footer: 'A solid background prevents content behind a translucent button from showing through.', disabled: true },
          { title: 'Loading', footer: 'The loading overlay follows the same corners.', loading: true },
        ].map(({ title, footer, custom, disabled, loading }) => (
          <Section key={title} header={title} footer={footer}>
            <div style={{ padding: 16 }}>
              <div style={{
                ...(custom ? { [radius]: '18px' } : {}),
                background: 'var(--tgui--bg_color)',
                borderRadius: `var(${radius})`,
              } as CSSProperties}
              >
                <Button {...args} stretched disabled={disabled ?? args.disabled} loading={loading ?? args.loading} />
              </div>
            </div>
          </Section>
        ))}
      </List>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: [
          'Button and its solid background share a size-specific CSS variable from AppRoot.',
          'Set the variable on AppRoot, a shared container, or an individual Button to customize its corners.',
          '\n\n| Variable | Base | iOS |\n| --- | --- | --- |',
          '\n| `--tgui--button--border-radius--s` | 20px | 20px |',
          '\n| `--tgui--button--border-radius--m` | 8px | 12px |',
          '\n| `--tgui--button--border-radius--l` | 8px | 8px |',
        ].join(' '),
      },
      source: {
        code: `import type { CSSProperties } from 'react';
import '@telegram-apps/telegram-ui/dist/styles.css';
import { AppRoot, Button } from '@telegram-apps/telegram-ui';

const backgroundStyle: CSSProperties = {
  background: 'var(--tgui--bg_color)',
  borderRadius: 'var(--tgui--button--border-radius--m)',
};

<AppRoot>
  {/* A solid background with the same platform-specific corners as the button. */}
  <div style={backgroundStyle}>
    <Button size="m" mode="bezeled" stretched disabled>Continue</Button>
  </div>
  {/* Override both the background and button locally. */}
  <div style={{
    ...backgroundStyle,
    '--tgui--button--border-radius--m': '18px',
  } as CSSProperties}>
    <Button size="m" mode="bezeled" stretched>Continue</Button>
  </div>
</AppRoot>`,
      },
    },
  },
} satisfies Story;
