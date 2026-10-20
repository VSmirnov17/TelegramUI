import { type CSSProperties, useId, useRef, useState } from 'react';
import { AppRoot, Banner, Button, Section, Tooltip } from '@telegram-apps/telegram-ui';
import styles from './Fonts.module.css';

const appFont: CSSProperties & { '--tgui--font-family': string } = {
  '--tgui--font-family': 'Georgia, serif',
};

<AppRoot style={appFont}>{/* Your application */}</AppRoot>;

// Render inside AppRoot.
export function FontSection() {
  const target = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [shown, setShown] = useState(false);
  return (
    <Section className={styles.customFont} header="Actions">
      <Banner header="Custom typography">
        <Button ref={target} aria-describedby={shown ? tooltipId : undefined} onClick={() => setShown(!shown)}>
          Toggle tooltip
        </Button>
      </Banner>
      {shown && (
        <Tooltip id={tooltipId} role="tooltip" targetRef={target} className={styles.customFont}>
          Custom tooltip typography
        </Tooltip>
      )}
    </Section>
  );
}
