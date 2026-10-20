/** @jest-environment jsdom */
import { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { Input } from 'components/Form/Input/Input';
import { Textarea } from 'components/Form/Textarea/Textarea';
import { AppRoot } from 'components/Service/AppRoot/AppRoot';
import { Cell } from './Cell';

type Platform = 'base' | 'ios';

let setPlatform: (platform: Platform) => void;

const Form = () => {
  const [platform, setCurrentPlatform] = useState<Platform>('base');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  setPlatform = setCurrentPlatform;

  return (
    <AppRoot platform={platform} appearance="light">
      <Cell subtitle="Subtitle" description="Description">
        <Input
          aria-label="Name"
          header="Name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </Cell>
      <Cell>
        <Textarea
          aria-label="Note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Cell>
    </AppRoot>
  );
};

const setNativeValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype = Object.getPrototypeOf(element);
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('form fields inside Cell', () => {
  let root: Root;
  let container: HTMLDivElement;
  const previousActEnvironment = Reflect.get(global, 'IS_REACT_ACT_ENVIRONMENT');

  beforeEach(() => {
    Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<Form />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: previousActEnvironment });
  });

  const query = <T extends Element>(selector: string) => container.querySelector(selector) as T;

  it.each([
    ['input', 'Name'],
    ['textarea', 'Note'],
  ])('keeps the %s focused and in the same node while typing', (tag, label) => {
    const field = query<HTMLInputElement | HTMLTextAreaElement>(`${tag}[aria-label="${label}"]`);
    act(() => field.focus());

    ['H', 'He', 'Hel', 'Hello'].forEach((text) => {
      act(() => setNativeValue(field, text));
      expect(query(`${tag}[aria-label="${label}"]`)).toBe(field);
      expect(document.activeElement).toBe(field);
      expect(field.value).toBe(text);
    });
  });

  it('keeps focus, value, selection and Cell text nodes when the platform changes', () => {
    const input = query<HTMLInputElement>('input[aria-label="Name"]');
    const textarea = query<HTMLTextAreaElement>('textarea[aria-label="Note"]');
    const subtitle = container.querySelector('[class*="subtitle"]');
    const description = container.querySelector('[class*="description"]');
    const head = container.querySelector('[class*="head"]');

    act(() => input.focus());
    act(() => setNativeValue(input, 'Hello'));
    act(() => setNativeValue(textarea, 'Note'));
    act(() => input.setSelectionRange(1, 4));

    act(() => setPlatform('ios'));

    expect(query('input[aria-label="Name"]')).toBe(input);
    expect(query('textarea[aria-label="Note"]')).toBe(textarea);
    expect(container.querySelector('[class*="subtitle"]')).toBe(subtitle);
    expect(container.querySelector('[class*="description"]')).toBe(description);
    expect(container.querySelector('[class*="head"]')).toBe(head);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Hello');
    expect(textarea.value).toBe('Note');
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
  });
});
