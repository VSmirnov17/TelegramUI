import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Cell, Icon28Chat, Icon28Devices } from '../index';
import * as Icons from './index';

const usageCode = `import { Cell, Icon28Chat, Icon28Devices } from '@telegram-apps/telegram-ui';

<>
  <Cell before={<Icon28Chat aria-hidden />}>Chat Settings</Cell>
  <Cell before={<Icon28Devices aria-hidden />}>Data and Storage</Cell>
</>`;

const meta = {
  title: 'Icons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Import icons from @telegram-apps/telegram-ui alongside components. The number in the name is the default size in pixels. Icons accept standard SVG props; monochrome icons inherit currentColor.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const IconCatalog = () => {
  const [query, setQuery] = useState('');
  const icons = Object.entries(Icons).filter(([name]) => name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div style={{ color: 'var(--tgui--text_color)' }}>
      <label>
        Search icons
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Chat, chevron, 28…"
          style={{ display: 'block', margin: '8px 0 16px', padding: 8, width: '100%', maxWidth: 320 }}
        />
      </label>
      <p role="status">{icons.length} icons</p>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, padding: 0, listStyle: 'none' }}>
        {icons.map(([name, IconComponent]) => (
          <li
            key={name}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, background: 'var(--tgui--secondary_bg_color)' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0 }}>
              <IconComponent aria-hidden />
            </span>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      {icons.length === 0 && <p>No matching icons.</p>}
    </div>
  );
};

export const Catalog: Story = {
  render: () => <IconCatalog />,
  parameters: {
    docs: { source: { code: 'import { Icon28Chat } from \'@telegram-apps/telegram-ui\';\n\n<Icon28Chat aria-hidden />' } },
  },
};

export const Usage: Story = {
  render: () => (
    <>
      <Cell before={<Icon28Chat aria-hidden />}>Chat Settings</Cell>
      <Cell before={<Icon28Devices aria-hidden />}>Data and Storage</Cell>
    </>
  ),
  parameters: {
    docs: { source: { code: usageCode } },
  },
};
