import { useId, useRef, useState } from 'react';
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
}

// Render inside AppRoot with the library stylesheet loaded.
export function DateField() {
  const id = useId();
  const [date, setDate] = useState('2026-10-20');
  return (
    <>
      <Text Component="label" htmlFor={id}>Appointment date</Text>
      <Input
        id={id}
        type="date"
        value={date}
        min="2026-01-01"
        max="2026-12-31"
        required
        onChange={(event) => setDate(event.currentTarget.value)}
      />
    </>
  );
}
