'use client';

import { useEffect, useState } from 'react';
import { AppRoot, Button, Input, Modal, Multiselect, Section } from '@telegram-apps/telegram-ui';

const Consumer = () => {
  const [hydrated, setHydrated] = useState(false);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState([]);
  useEffect(() => setHydrated(true), []);

  return (
    <main data-hydrated={hydrated} style={{ maxWidth: 480, margin: 'auto' }}>
      <AppRoot data-testid="auto">
        <Section header="Packed library in Next 15">
          <input aria-label="Draft" defaultValue="Server draft" />
          <Input aria-label="Library input" defaultValue="Library draft" />
          <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>
        </Section>
        <AppRoot data-testid="inherited"><span>Inherited settings</span></AppRoot>
        <AppRoot data-testid="override" platform="base" appearance="light"><span>Explicit settings</span></AppRoot>
        <Modal
          aria-label="Platform form"
          aria-describedby={undefined}
          trigger={<Button>Open form</Button>}
          header={<Modal.Header>Choose platforms</Modal.Header>}
        >
          <div style={{ minHeight: 300, padding: 16 }}>
            <Multiselect
              aria-label="Platforms"
              options={[{ value: 'ios', label: 'iOS' }, { value: 'web', label: 'Web' }]}
              value={selected}
              onChange={setSelected}
            />
            <output data-testid="selection">{selected.map((option) => option.label).join(', ')}</output>
            <Modal.Close><Button>Done</Button></Modal.Close>
          </div>
        </Modal>
      </AppRoot>
      <AppRoot data-testid="explicit" platform="ios" appearance="dark">
        <AppRoot data-testid="explicit-inherited"><span>Explicit tree</span></AppRoot>
      </AppRoot>
    </main>
  );
};

export default Consumer;
