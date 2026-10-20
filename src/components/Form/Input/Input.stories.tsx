import { useId, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Icon24Close } from 'icons/24/close';

import { Button, Section, Tappable, Text } from 'components';
import { List } from 'components/Blocks/List/List';
import { Input } from './Input';

const meta = {
  title: 'Form/Input',
  component: Input,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <List style={{
        width: 400,
        maxWidth: '100%',
        margin: 'auto',
        background: 'var(--tgui--secondary_bg_color)',
      }}>
        <Input
          header="Input"
          placeholder="I am usual input, just leave me alone"
        />
        <Input
          status="error"
          header="Input"
          placeholder="I am error input, don't make my mistakes..."
        />
        <Input
          status="focused"
          header="Input"
          placeholder="I am focused input, are u focused on me?"
        />
        <Input
          disabled
          header="Input"
          placeholder="I am disabled input"
        />
        <Input
          status="focused"
          header="Input"
          placeholder="Write and clean me"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          after={(
            <Tappable
              Component="div"
              style={{ display: 'flex' }}
              onClick={() => setValue('')}
            >
              <Icon24Close />
            </Tappable>
          )}
        />
      </List>
    );
  },
} satisfies Story;

export const CustomBackground: Story = {
  args: {
    rootStyle: { backgroundColor: 'var(--tgui--tertiary_bg_color)', borderRadius: 12 },
    style: { color: 'var(--tgui--accent_text_color)' },
    header: 'Custom background',
    placeholder: 'Type here',
    before: <Text aria-hidden>€</Text>,
  },
  render: (args) => (
    <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
      <Section header="Custom background" footer="The container follows the current theme. Text color is set on the native input.">
        <Input {...args} aria-label="Custom background" />
        <Input {...args} status="error" header="Error" aria-label="Custom background error" />
        <Input {...args} disabled header="Disabled" aria-label="Custom background disabled" />
      </Section>
      <Section header="Default appearance">
        <Input header="Default background" placeholder="Unchanged default" aria-label="Default background" />
      </Section>
    </List>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use rootStyle to style the whole container, including the header and icon areas. The style prop continues to style the native input.',
      },
      source: {
        code: `<Input
  header="Custom background"
  rootStyle={{ backgroundColor: 'var(--tgui--tertiary_bg_color)', borderRadius: 12 }}
  style={{ color: 'var(--tgui--accent_text_color)' }}
  placeholder="Type here"
/>`,
      },
    },
  },
  play: ({ canvasElement, args }) => {
    const inputs = canvasElement.querySelectorAll('input');
    Array.from(inputs).slice(0, 3).forEach((input) => {
      const label = input.closest('label')!;
      const root = label.parentElement!;
      const reference = document.createElement('div');
      reference.style.backgroundColor = args.rootStyle?.backgroundColor || '';
      root.appendChild(reference);
      const expectedBackground = getComputedStyle(reference).backgroundColor;
      reference.remove();
      if (getComputedStyle(root).backgroundColor !== expectedBackground) {
        throw new Error('rootStyle must set the background of the whole form container');
      }
      if (getComputedStyle(label).backgroundColor !== 'rgba(0, 0, 0, 0)') {
        throw new Error('The label must expose the custom container background');
      }
      if (input.style.color !== args.style?.color || root.style.color !== '') {
        throw new Error('style must continue to apply to the native input');
      }
    });
    if (inputs[3].closest('label')!.parentElement!.style.backgroundColor !== '') {
      throw new Error('Custom backgrounds must not affect adjacent inputs');
    }
  },
};

const DateInputExample = () => {
  const dateId = useId();
  const helpId = useId();
  const messageId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState('2026-10-20');
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState('Not submitted.');

  const changeDate = (value: string) => {
    setDate(value);
    setInvalid(false);
    setMessage('Not submitted.');
  };

  return (
    <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
      <Section header="Native date input" showDividers={false} bodyProps={{ style: { padding: 16 } }}>
        <form onSubmit={(event) => {
          event.preventDefault();
          setMessage(`Saved ${date}.`);
        }}>
          <List>
            <div><Text Component="label" htmlFor={dateId} weight="2">Appointment date</Text></div>
            <Input
              ref={input}
              id={dateId}
              type="date"
              value={date}
              min="2026-01-01"
              max="2026-12-31"
              required
              aria-describedby={`${helpId} ${messageId}`}
              aria-invalid={invalid || undefined}
              status={invalid ? 'error' : undefined}
              onChange={(event) => changeDate(event.currentTarget.value)}
              onInvalid={() => {
                setInvalid(true);
                setMessage('Choose a date from 2026-01-01 to 2026-12-31.');
              }}
            />
            <Text Component="p" id={helpId}>Choose a date in 2026. The value uses YYYY-MM-DD.</Text>
            <Text Component="p">Value: {date || '(empty)'}</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Button size="s" type="submit">Save</Button>
              <Button size="s" type="button" mode="gray" onClick={() => changeDate('')}>Clear</Button>
              <Button size="s" type="button" mode="gray" onClick={() => changeDate('2026-10-20')}>Reset</Button>
              <Button size="s" type="button" mode="gray" onClick={() => input.current?.focus()}>Focus date</Button>
            </div>
            <Text Component="p" id={messageId} role="status">{message}</Text>
          </List>
        </form>
      </Section>
      <Section header="Native states" showDividers={false} bodyProps={{ style: { padding: 16 } }}>
        <List>
          <div><Text Component="label" htmlFor={`${dateId}-disabled`}>Disabled date</Text></div>
          <Input id={`${dateId}-disabled`} type="date" defaultValue="2026-10-20" disabled />
          <div><Text Component="label" htmlFor={`${dateId}-readonly`}>Read-only date</Text></div>
          <Input id={`${dateId}-readonly`} type="date" defaultValue="2026-10-20" readOnly />
        </List>
      </Section>
    </List>
  );
};

const dateSource = `import { useId, useRef, useState } from 'react';
import { Button, Input, List, Section, Text } from '@telegram-apps/telegram-ui';

// Render inside AppRoot and import the library stylesheet in your application.
export function DateInputExample() {
  const dateId = useId();
  const helpId = useId();
  const messageId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState('2026-10-20');
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState('Not submitted.');

  const changeDate = (value: string) => {
    setDate(value);
    setInvalid(false);
    setMessage('Not submitted.');
  };

  return (
    <List style={{ width: 400, maxWidth: '100%', margin: 'auto', background: 'var(--tgui--secondary_bg_color)' }}>
      <Section header="Native date input" showDividers={false} bodyProps={{ style: { padding: 16 } }}>
        <form onSubmit={(event) => {
          event.preventDefault();
          setMessage(\`Saved \${date}.\`);
        }}>
          <List>
            <div><Text Component="label" htmlFor={dateId} weight="2">Appointment date</Text></div>
            <Input
              ref={input}
              id={dateId}
              type="date"
              value={date}
              min="2026-01-01"
              max="2026-12-31"
              required
              aria-describedby={\`\${helpId} \${messageId}\`}
              aria-invalid={invalid || undefined}
              status={invalid ? 'error' : undefined}
              onChange={(event) => changeDate(event.currentTarget.value)}
              onInvalid={() => {
                setInvalid(true);
                setMessage('Choose a date from 2026-01-01 to 2026-12-31.');
              }}
            />
            <Text Component="p" id={helpId}>Choose a date in 2026. The value uses YYYY-MM-DD.</Text>
            <Text Component="p">Value: {date || '(empty)'}</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Button size="s" type="submit">Save</Button>
              <Button size="s" type="button" mode="gray" onClick={() => changeDate('')}>Clear</Button>
              <Button size="s" type="button" mode="gray" onClick={() => changeDate('2026-10-20')}>Reset</Button>
              <Button size="s" type="button" mode="gray" onClick={() => input.current?.focus()}>Focus date</Button>
            </div>
            <Text Component="p" id={messageId} role="status">{message}</Text>
          </List>
        </form>
      </Section>
      <Section header="Native states" showDividers={false} bodyProps={{ style: { padding: 16 } }}>
        <List>
          <div><Text Component="label" htmlFor={\`\${dateId}-disabled\`}>Disabled date</Text></div>
          <Input id={\`\${dateId}-disabled\`} type="date" defaultValue="2026-10-20" disabled />
          <div><Text Component="label" htmlFor={\`\${dateId}-readonly\`}>Read-only date</Text></div>
          <Input id={\`\${dateId}-readonly\`} type="date" defaultValue="2026-10-20" readOnly />
        </List>
      </Section>
    </List>
  );
}
`;

export const Date: Story = {
  render: () => <DateInputExample />,
  parameters: {
    docs: {
      description: {
        story: 'Native date input with ISO values, bounds, validation and focus. Display format and picker UI belong to the browser and locale.',
      },
      source: { code: dateSource },
    },
  },
};
