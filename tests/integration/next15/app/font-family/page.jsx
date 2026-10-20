'use client';

import { useEffect, useRef, useState } from 'react';
import { AppRoot, Banner, Button, List, Section, Tooltip } from '@telegram-apps/telegram-ui';
import styles from './Fonts.module.css';

function TooltipButton({ id, className }) {
  const target = useRef(null);
  const [shown, setShown] = useState(false);
  return (
    <>
      <Button
        ref={target}
        size="s"
        aria-label={`Toggle ${id}`}
        aria-pressed={shown}
        aria-describedby={shown ? `${id}-tooltip` : undefined}
        onClick={() => setShown(!shown)}
      >
        {id === 'scoped-explicit' ? 'Scoped tooltip' : 'Show tooltip'}
      </Button>
      {shown && (
        <Tooltip id={`${id}-tooltip`} role="tooltip" targetRef={target} className={className}>
          {id} tooltip text
        </Tooltip>
      )}
    </>
  );
}

function FontSection({ id, className, style, scoped = false }) {
  return (
    <Section data-testid={id} className={className} style={style} header={`${id} section`}>
      <Banner header={`${id} banner`} subheader={`${id} description`}>
        <List>
          <div><TooltipButton id={`${id}-portal`} /></div>
          {scoped && <div><TooltipButton id="scoped-explicit" className={styles.customFont} /></div>}
        </List>
      </Banner>
    </Section>
  );
}

export default function FontFamily() {
  const [hydrated, setHydrated] = useState(false);
  const [platform, setPlatform] = useState('base');
  const [appearance, setAppearance] = useState('light');
  const globalPortal = useRef(null);
  const defaultPortal = useRef(null);
  useEffect(() => setHydrated(true), []);

  return (
    <main data-testid="font-family" data-hydrated={hydrated} data-platform={platform} data-appearance={appearance}>
      <button onClick={() => setPlatform(platform === 'base' ? 'ios' : 'base')}>Switch font platform</button>
      <button onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}>Switch font appearance</button>
      <AppRoot
        data-testid="global-font-root"
        platform={platform}
        appearance={appearance}
        portalContainer={globalPortal}
        style={{ '--tgui--font-family': 'serif' }}
      >
        <FontSection id="global" />
      </AppRoot>
      <AppRoot data-testid="default-font-root" platform={platform} appearance={appearance} portalContainer={defaultPortal}>
        <FontSection id="scoped" className={styles.customFont} scoped />
        <FontSection id="default" />
        <FontSection id="inherited" style={{ fontFamily: 'cursive' }} />
      </AppRoot>
    </main>
  );
}
