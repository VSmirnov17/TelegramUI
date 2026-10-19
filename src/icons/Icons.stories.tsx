import { useState } from 'react';
import styles from './Icons.stories.module.css';

import type { Meta, StoryObj } from '@storybook/react';

import { Caption, Cell, Icon28Chat, Icon28Devices, Input, List, Placeholder, Section, Text, Title } from '../index';
import * as Icons from './index';

const usageCode = `import { Cell, Icon28Chat, Icon28Devices } from '@telegram-apps/telegram-ui';

<>
  <Cell before={<Icon28Chat aria-hidden />}>Chat Settings</Cell>
  <Cell before={<Icon28Devices aria-hidden />}>Data and Storage</Cell>
</>`;

const meta = {
  title: 'Icons',
  parameters: {
    layout: 'fullscreen',
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
    <List className={styles.catalog}>
      <div className={styles.intro}>
        <Title level="3" weight="2">Icon library</Title>
        <Text Component="p" className={styles.description}>Find an icon by name or size, then import it alongside your components.</Text>
      </div>
      <Section>
        <Input
          type="search"
          header="Search icons"
          aria-label="Search icons"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Chat, chevron, 28…"
        />
      </Section>
      <Caption Component="p" role="status" className={styles.description}>{icons.length} icons</Caption>
      <ul className={styles.grid}>
        {icons.map(([name, IconComponent]) => (
          <Cell
            Component="li"
            key={name}
            readOnly
            multiline
            className={styles.card}
            before={<span className={styles.icon}><IconComponent aria-hidden /></span>}
          >
            <Caption Component="code" className={styles.name}>{name}</Caption>
          </Cell>
        ))}
      </ul>
      {icons.length === 0 && <Placeholder header="No matching icons." description="Try another name or size." />}
    </List>
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
