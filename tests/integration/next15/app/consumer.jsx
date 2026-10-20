'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppRoot, Button, Cell, Input, Modal, Multiselect, Section } from '@telegram-apps/telegram-ui';

const RefLifecycle = () => {
  const [phase, setPhase] = useState('first');
  const first = useCallback((node) => {
    if (node) {
      window.__refLifecycle.push('first attached');
      return () => { window.__refLifecycle.push('first cleaned'); };
    }
    window.__refLifecycle.push('first null');
  }, []);
  const second = useCallback((node) => {
    if (node) {
      window.__refLifecycle.push('second attached');
      return () => { window.__refLifecycle.push('second cleaned'); };
    }
    window.__refLifecycle.push('second null');
  }, []);
  const legacy = useCallback((node) => {
    window.__refLifecycle.push(node ? 'legacy attached' : 'legacy null');
  }, []);
  return (
    <div>
      {phase !== 'hidden' && (
        <AppRoot platform="base" appearance="light" ref={phase === 'first' ? first : second}>
          <Multiselect ref={legacy} value={[]} options={[]} aria-label="Ref lifecycle" />
        </AppRoot>
      )}
      <button type="button" onClick={() => setPhase('second')}>Replace callback ref</button>
      <button type="button" onClick={() => setPhase('hidden')}>Unmount callback refs</button>
    </div>
  );
};

const Consumer = () => {
  const [hydrated, setHydrated] = useState(false);
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [selectedAndClose, setSelectedAndClose] = useState([]);
  useEffect(() => setHydrated(true), []);

  return (
    <main data-hydrated={hydrated} style={{ maxWidth: 480, margin: 'auto' }}>
      <AppRoot data-testid="auto">
        <Section header="Packed library in Next 15">
          <Cell description="Rendered on the server">
            <Input aria-label="Draft" defaultValue="Server draft" />
          </Cell>
          <Cell>
            <Input aria-label="Cell name" value={name} onChange={(event) => setName(event.target.value)} />
          </Cell>
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
            <Multiselect
              aria-label="Platforms and close"
              closeDropdownAfterSelect
              options={[{ value: 'ios', label: 'iOS' }, { value: 'web', label: 'Web' }]}
              value={selectedAndClose}
              onChange={setSelectedAndClose}
            />
            <output data-testid="selection-and-close">{selectedAndClose.map((option) => option.label).join(', ')}</output>
            <output data-testid="selection">{selected.map((option) => option.label).join(', ')}</output>
            <Modal.Close><Button>Done</Button></Modal.Close>
          </div>
        </Modal>
      </AppRoot>
      <RefLifecycle />
      <AppRoot data-testid="explicit" platform="ios" appearance="dark">
        <AppRoot data-testid="explicit-inherited"><span>Explicit tree</span></AppRoot>
      </AppRoot>
    </main>
  );
};

export default Consumer;
