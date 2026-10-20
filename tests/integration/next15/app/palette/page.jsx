'use client';

import { useRef, useState } from 'react';
import { AppRoot, Popper } from '@telegram-apps/telegram-ui';

// Distinct SDK colors expose accidental sourcing of any Telegram-backed token.
const telegramNames = [
  'bg-color', 'text-color', 'hint-color', 'link-color', 'button-color', 'button-text-color',
  'secondary-bg-color', 'header-bg-color', 'accent-text-color', 'section-bg-color',
  'section-header-text-color', 'subtitle-text-color', 'destructive-text-color',
];
const incoming = Object.fromEntries(telegramNames.map((name, index) => [
  `--tg-theme-${name}`, `#${String(index + 1).padStart(6, '0')}`,
]));

export default function Palette() {
  const [appearance, setAppearance] = useState('light');
  const [platform, setPlatform] = useState('base');
  const [ignoreTelegramTheme, setIgnoreTelegramTheme] = useState(false);
  const [telegram, setTelegram] = useState(true);
  const portal = useRef(null);
  const target = useRef(null);
  const inheritedPortal = useRef(null);
  const resetPortal = useRef(null);
  const overridePortal = useRef(null);

  return (
    <main>
      <button onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}>Toggle appearance</button>
      <button onClick={() => setPlatform(platform === 'base' ? 'ios' : 'base')}>Toggle platform</button>
      <button onClick={() => setIgnoreTelegramTheme(!ignoreTelegramTheme)}>Toggle library colors</button>
      <button onClick={() => setTelegram(!telegram)}>Toggle incoming colors</button>
      <AppRoot
        data-testid="palette"
        data-appearance={appearance}
        data-platform={platform}
        data-library={ignoreTelegramTheme}
        data-telegram={telegram}
        appearance={appearance}
        platform={platform}
        ignoreTelegramTheme={ignoreTelegramTheme}
        portalContainer={portal}
        style={telegram ? incoming : {}}
      >
        <button ref={target}>Portal target</button>
        <div data-testid="portal-source">
          <Popper targetRef={target} data-testid="palette-portal">Portal colors</Popper>
        </div>
        <AppRoot data-testid="palette-inherited" portalContainer={inheritedPortal} />
        <AppRoot data-testid="palette-reset" ignoreTelegramTheme={false} portalContainer={resetPortal} />
        <AppRoot data-testid="palette-override" portalContainer={overridePortal} style={{ '--tgui--bg_color': '#abcdef' }} />
      </AppRoot>
    </main>
  );
}
