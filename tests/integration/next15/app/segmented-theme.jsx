'use client';

import { useRef, useState } from 'react';
import { AppRoot, SegmentedControl } from '@telegram-apps/telegram-ui';

// The SDK may supply dark CSS colors before React detects its color scheme.
const telegramDark = {
  '--tg-theme-bg-color': '#17212b',
  '--tg-theme-secondary-bg-color': '#232e3c',
  '--tg-theme-text-color': '#ffffff',
};

const Period = ({ id }) => {
  const [period, setPeriod] = useState('Week');
  return (
    <SegmentedControl data-testid={id} aria-label={id}>
      {['Day', 'Week', 'Month'].map((label) => (
        <SegmentedControl.Item key={label} selected={period === label} onClick={() => setPeriod(label)}>
          {label}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl>
  );
};

const ScopedPeriod = ({ id, platform, appearance, telegram = false }) => {
  const portalContainer = useRef(null);
  return (
    <div data-testid={`${id}-host`} style={telegram ? telegramDark : undefined}>
      <AppRoot platform={platform} appearance={appearance} portalContainer={portalContainer}>
        <Period id={id} />
      </AppRoot>
    </div>
  );
};

export const SegmentedThemeProbes = () => (
  <div style={{ display: 'grid', gap: 12, padding: 16 }}>
    <Period id="segmented-auto" />
    <ScopedPeriod id="segmented-sdk" telegram />
    {['base', 'ios'].flatMap((platform) => ['light', 'dark'].map((appearance) => (
      <ScopedPeriod key={`${platform}-${appearance}`} id={`segmented-${platform}-${appearance}`} platform={platform} appearance={appearance} />
    )))}
  </div>
);
