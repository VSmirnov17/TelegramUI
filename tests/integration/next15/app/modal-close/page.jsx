'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppRoot, Button, Modal, Text } from '@telegram-apps/telegram-ui';

const recordChange = (id, open) => window.__closeEvents.push([id, open]);

function AsyncContent({ id, children }) {
  const close = useRef(null);
  const child = useRef(null);
  const operation = useRef(0);
  const [status, setStatus] = useState('Ready');
  const forwarded = useCallback((element) => {
    if (!element) return undefined;
    close.current = element;
    window.__closeRefs[id] = element;
    window.__closeChildren[id] = child;
    window.__closeLifecycle.push(`${id} attached`);
    return () => {
      close.current = null;
      window.__closeLifecycle.push(`${id} cleaned`);
    };
  }, [id]);

  useEffect(() => () => { operation.current += 1; }, []);

  const save = async () => {
    const current = ++operation.current;
    setStatus('Pending');
    try {
      await new Promise((resolve, reject) => { window.__closeRequests[id] = { resolve, reject }; });
      if (operation.current === current) close.current?.click();
    } catch {
      if (operation.current === current) setStatus('Rejected; retry');
    }
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text role="status">{status}</Text>
      <Button disabled={status === 'Pending'} onClick={save}>Save {id}</Button>
      <Modal.Close
        ref={forwarded}
        data-testid={`${id}-close`}
        aria-label={`Close ${id}`}
        onClick={() => {
          operation.current += 1;
          window.__nativeCloseClicks.push(id);
        }}
      >
        <Button ref={child}>Close {id}</Button>
      </Modal.Close>
      {children}
    </div>
  );
}

export default function ModalClosePage() {
  const [platform, setPlatform] = useState('base');
  const [appearance, setAppearance] = useState('light');
  const [controlled, setControlled] = useState(false);
  const controlledClose = useRef(null);
  const modalRef = useCallback((element) => { window.__modalDiv = element; }, []);

  return (
    <AppRoot platform={platform} appearance={appearance} data-testid="close-root" data-platform={platform} data-appearance={appearance}>
      <Button onClick={() => setPlatform(platform === 'base' ? 'ios' : 'base')}>Toggle close platform</Button>
      <Button onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}>Toggle close appearance</Button>
      <Modal ref={modalRef} trigger={<Button>Open async form</Button>} header={<Modal.Header>Async form</Modal.Header>} onOpenChange={(open) => recordChange('outer', open)}>
        <AsyncContent id="outer">
          <Modal nested trigger={<Button>Open nested async form</Button>} header={<Modal.Header>Nested async form</Modal.Header>} onOpenChange={(open) => recordChange('nested', open)}>
            <AsyncContent id="nested" />
          </Modal>
        </AsyncContent>
      </Modal>
      <Modal
        open={controlled}
        trigger={<Button>Open controlled form</Button>}
        header={<Modal.Header>Controlled form</Modal.Header>}
        onOpenChange={(open) => {
          recordChange('controlled', open);
          if (open) setControlled(true);
        }}
      >
        <Modal.Close ref={controlledClose}><Button>Request controlled close</Button></Modal.Close>
        <Button onClick={() => controlledClose.current?.click()}>Click controlled ref</Button>
        <Button onClick={() => setControlled(false)}>Apply controlled close</Button>
      </Modal>
    </AppRoot>
  );
}
