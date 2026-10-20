/** @jest-environment jsdom */
import { ReactNode, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { AppRoot } from 'components/Service/AppRoot/AppRoot';
import { Select } from './Select';

const options = (
  <>
    <option value="iphone">iPhone</option>
    <option value="windows">Windows</option>
  </>
);

const ControlledSelect = () => {
  const [device, setDevice] = useState('iphone');

  return (
    <>
      <Select header="Select your device" value={device} onChange={(event) => setDevice(event.target.value)}>
        {options}
      </Select>
      <output>{device}</output>
    </>
  );
};

describe('Select headers', () => {
  let root: Root;
  let container: HTMLDivElement;
  const previousActEnvironment = Reflect.get(global, 'IS_REACT_ACT_ENVIRONMENT');

  beforeEach(() => {
    Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: previousActEnvironment });
  });

  const render = (children: ReactNode, platform: 'base' | 'ios' = 'ios') => {
    act(() => root.render(<AppRoot platform={platform} appearance="light">{children}</AppRoot>));
  };

  const findHeader = (text: string) => [...container.querySelectorAll('label')]
    .find((label) => label.textContent === text);

  it.each([undefined, 'device'])('associates the iOS caption with the select when id is %s', (id) => {
    render(<Select id={id} header="Select your device">{options}</Select>);

    const select = container.querySelector('select')!;
    const header = findHeader('Select your device');
    expect(header).toBeDefined();
    expect(header?.control).toBe(select);
    expect(select.labels).toContain(header);
    expect(select.id).not.toBe('');
    if (id) {
      expect(select.id).toBe(id);
    }
  });

  it('associates each iOS caption with its own select', () => {
    render(
      <>
        <Select header="First device">{options}</Select>
        <Select header="Second device">{options}</Select>
      </>,
    );

    const [first, second] = container.querySelectorAll('select');
    expect(first.id).not.toBe(second.id);
    expect(findHeader('First device')?.control).toBe(first);
    expect(findHeader('Second device')?.control).toBe(second);
  });

  it('keeps the iOS caption associated after a controlled selection changes', () => {
    render(<ControlledSelect />);

    const select = container.querySelector('select')!;
    const { id } = select;
    expect(findHeader('Select your device')?.control).toBe(select);
    expect(container.querySelector('output')?.textContent).toBe('iphone');

    act(() => {
      select.value = 'windows';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const updatedSelect = container.querySelector('select')!;
    expect(updatedSelect.value).toBe('windows');
    expect(container.querySelector('output')?.textContent).toBe('windows');
    expect(updatedSelect.id).toBe(id);
    expect(findHeader('Select your device')?.control).toBe(updatedSelect);
  });

  it('preserves the base header', () => {
    render(<Select header="Select your device">{options}</Select>, 'base');

    expect(container.textContent).toContain('Select your device');
    expect(container.querySelector('select')?.value).toBe('iphone');
  });

  it.each(['base', 'ios'] as const)('supports a select without a header on %s', (platform) => {
    render(<Select aria-label="Device">{options}</Select>, platform);

    const select = container.querySelector('select')!;
    expect(select.getAttribute('aria-label')).toBe('Device');
    expect(select.value).toBe('iphone');
    expect(container.textContent).toBe('iPhoneWindows');
    expect(container.querySelector('label[for]')).toBeNull();
  });
});
