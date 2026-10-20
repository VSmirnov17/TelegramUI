'use client';

import { useEffect, useRef, useState } from 'react';
import { AppRoot, Button, Cell, Icon28Chat, Icon28Devices, List, Section, Tabbar } from '@telegram-apps/telegram-ui';

const tabs = [
  { id: 'devices', text: 'Devices', Icon: Icon28Devices },
  { id: 'chat', text: 'Chat', Icon: Icon28Chat },
];

export default function TabbarLayout() {
  const panel = useRef(null);
  const [height, setHeight] = useState(0);
  const [tab, setTab] = useState('devices');
  const [platform, setPlatform] = useState('base');
  const [appearance, setAppearance] = useState('light');
  const [labels, setLabels] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const element = panel.current;
    if (!element) return undefined;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element, { box: 'border-box' });
    return () => observer.disconnect();
  }, []);

  return (
    <AppRoot
      data-testid="tabbar-layout"
      platform={platform}
      appearance={appearance}
      style={{ '--tgui--safe_area_inset_bottom': '0px' }}
    >
      <main data-testid="page-content" style={{ paddingBottom: height + 16 }}>
        <Section header="Page layout controls">
          <Cell><Button onClick={() => setPlatform(platform === 'base' ? 'ios' : 'base')}>Switch platform</Button></Cell>
          <Cell><Button onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}>Switch appearance</Button></Cell>
          <Cell><label><input type="checkbox" checked={labels} onChange={(event) => setLabels(event.target.checked)} />Show labels</label></Cell>
        </Section>
        <List>
          <Section header={`${tab} page`}>
            {Array.from({ length: 36 }, (_, index) => (
              <Cell key={index}>{tab} row {index + 1}</Cell>
            ))}
          </Section>
          <Button data-testid="last-action" onClick={() => setCompleted(true)}>Finish {tab}</Button>
          {completed && <p role="status">Page action completed</p>}
        </List>
      </main>
      <Tabbar ref={panel} data-testid="page-tabbar" aria-label="Main navigation">
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={labels ? text : undefined}
            aria-label={text}
            aria-pressed={tab === id}
            selected={tab === id}
            onClick={() => { setTab(id); setCompleted(false); }}
          >
            <Icon />
          </Tabbar.Item>
        ))}
      </Tabbar>
    </AppRoot>
  );
}
