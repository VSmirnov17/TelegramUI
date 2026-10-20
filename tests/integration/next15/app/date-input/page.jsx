'use client';

import { useEffect, useRef, useState } from 'react';
import { AppRoot, Input } from '@telegram-apps/telegram-ui';

function DateFields({ id }) {
  const input = useRef(null);
  return (
    <>
      <Input ref={input} data-testid={`${id}-date`} aria-label={`${id} date`} type="date" defaultValue="2026-10-20" min="2026-01-01" max="2026-12-31" required />
      <Input data-testid={`${id}-light`} aria-label={`${id} light override`} type="date" defaultValue="2026-10-20" style={{ colorScheme: 'light', backgroundColor: '#fff', color: '#000' }} />
      <Input data-testid={`${id}-dark`} aria-label={`${id} dark override`} type="date" defaultValue="2026-10-20" style={{ colorScheme: 'dark', backgroundColor: '#212121', color: '#fff' }} />
      <Input data-testid={`${id}-text`} aria-label={`${id} text`} defaultValue="Text draft" />
      <button type="button" onClick={() => input.current?.focus()}>Focus {id} date</button>
    </>
  );
}

export default function DateInput() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <main data-testid="date-input" data-hydrated={hydrated} style={{ maxWidth: 400, margin: 'auto' }}>
      <AppRoot data-testid="date-auto"><DateFields id="auto" /></AppRoot>
      {['base', 'ios'].map((platform) => ['light', 'dark'].map((appearance) => {
        const id = `${platform}-${appearance}`;
        return (
          <AppRoot key={id} data-testid={`date-${id}`} platform={platform} appearance={appearance}>
            <DateFields id={id} />
          </AppRoot>
        );
      }))}
    </main>
  );
}
