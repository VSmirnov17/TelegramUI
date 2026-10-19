import type { Meta, StoryObj } from '@storybook/react';
import { Icon28Chat } from 'icons/28/chat';
import { Icon28Devices } from 'icons/28/devices';
import { Icon28Stats } from 'icons/28/stats';
import { setControlsTypes } from 'storybook/controls';

import { Cell } from 'components/Blocks/Cell/Cell';
import { IconContainer } from 'components/Blocks/IconContainer/IconContainer';
import { List } from 'components/Blocks/List/List';
import { Input } from 'components/Form/Input/Input';
import { Select } from 'components/Form/Select/Select';
import { Textarea } from 'components/Form/Textarea/Textarea';
import { Section } from './Section';

const meta = {
  title: 'Blocks/Section',
  component: Section,
  argTypes: setControlsTypes(['header', 'footer'], 'text'),
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

const cells = [
  {
    id: 1,
    icon: <Icon28Chat />,
    text: 'Chat Settings',
  },
  {
    id: 2,
    icon: <Icon28Devices />,
    text: 'Data and Storage',
  },
  {
    id: 3,
    icon: <Icon28Stats />,
    text: 'Devices',
  },
];

export const Playground: Story = {
  render: (args) => (
    <List style={{ background: 'var(--tgui--secondary_bg_color)', padding: '40px', width: 500 }}>
      <Section
        header="Main Settings"
        footer="The official Telegram app is available for Android, iPhone, iPad, Windows, macOS and Linux."
        {...args}
      >
        {cells.map((cell) => (
          <Cell
            key={cell.id}
            before={<IconContainer>{cell.icon}</IconContainer>}
          >
            {cell.text}
          </Cell>
        ))}
      </Section>
      <Section
        header="Personal Information"
        footer="The official Telegram app is available for Android, iPhone, iPad, Windows, macOS and Linux."
        {...args}
      >
        <Input
          header="First name"
          placeholder="21 y.o. designer from San Francisco"
        />
        <Input
          header="Last name"
          placeholder="21 y.o. designer from San Francisco"
        />
      </Section>
    </List>
  ),
} satisfies Story;

export const AdjacentErrors: Story = {
  render: () => (
    <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
      <Section header="Contact details" footer="Check the highlighted fields before continuing.">
        <Input header="Name" placeholder="Your name" aria-label="Contact name" />
        <Input status="error" header="Phone" placeholder="Enter a valid phone number" aria-label="Contact phone" />
        <Input status="error" header="Email" placeholder="Enter a valid email address" aria-label="Contact email" />
        <Input header="Address" placeholder="Your address" aria-label="Contact address" />
        <Input status="error" header="Postcode" placeholder="Enter a valid postcode" aria-label="Contact postcode" />
        <Input disabled header="Country" defaultValue="Germany" aria-label="Contact country" />
      </Section>
      <Section header="Two adjacent errors">
        <Input status="error" header="First name" placeholder="Required" aria-label="Required first name" />
        <Input status="error" header="Last name" placeholder="Required" aria-label="Required last name" />
      </Section>
      <Section header="Other form controls">
        <Input
          status="error"
          header="Subject"
          placeholder="Enter a subject"
          aria-label="Message subject"
          rootStyle={{ backgroundColor: 'var(--tgui--tertiary_bg_color)' }}
        />
        <Textarea status="error" header="Message" placeholder="Enter a message" aria-label="Message text" />
        <Select status="error" header="Category" aria-label="Message category" defaultValue="">
          <option value="" disabled>Select a category</option>
          <option value="general">General</option>
          <option value="support">Support</option>
        </Select>
      </Section>
    </List>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Adjacent error states in a Section, including first, middle, and last rows, mixed form controls, and a custom input background.',
      },
    },
  },
};
