/** @jest-environment jsdom */
import { createRef, ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { Icon28Close } from 'icons/28/close';

import { AppRoot } from 'components/Service/AppRoot/AppRoot';
import { Modal } from '../../Modal';

let root: Root;
let container: HTMLDivElement;
const previousActEnvironment = Reflect.get(global, 'IS_REACT_ACT_ENVIRONMENT');
const previousMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
const render = (children: ReactNode) => {
  act(() => root.render(<AppRoot platform="base" appearance="light">{children}</AppRoot>));
};

beforeEach(() => {
  Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false }) });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: previousActEnvironment });
  if (previousMatchMedia) {
    Object.defineProperty(window, 'matchMedia', previousMatchMedia);
  } else {
    Reflect.deleteProperty(window, 'matchMedia');
  }
});

it('forwards the actual button without a wrapper, preserves child/div refs and cleans up once', () => {
  const close: { current: HTMLButtonElement | null } = { current: null };
  const child = createRef<HTMLButtonElement>();
  const modal = createRef<HTMLDivElement>();
  const cleanup = jest.fn(() => { close.current = null; });
  const attached = jest.fn((element: Element | null) => {
    if (element instanceof HTMLButtonElement) {
      close.current = element;
      return cleanup;
    }
    return undefined;
  });
  const changes = jest.fn();
  const example = (label: string) => (
    <Modal ref={modal} trigger={<button type="button">Open</button>} onOpenChange={changes} header={<Modal.Header>Async form</Modal.Header>}>
      <Modal.Close ref={attached} aria-label={label}><button ref={child} type="button">Close</button></Modal.Close>
    </Modal>
  );
  render(example('Close form'));
  act(() => container.querySelector('button')!.click());
  expect(modal.current).toBe(document.querySelector('[role="dialog"]'));
  expect(close.current).toBe(child.current);
  expect(child.current?.parentElement?.closest('[role="dialog"]')).toBe(modal.current);
  const original = close.current;
  render(example('Close updated form'));
  expect(close.current).toBe(original);
  expect(attached).toHaveBeenCalledTimes(1);
  expect(original?.getAttribute('aria-label')).toBe('Close updated form');
  act(() => close.current?.click());
  expect(changes.mock.calls).toEqual([[true], [false]]);
  expect(child.current).toBeNull();
  expect(modal.current).toBeNull();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it('forwards an SVG ref without claiming that the child is a button', () => {
  const close = createRef<SVGSVGElement>();
  const changes = jest.fn();
  render(
    <Modal open onOpenChange={changes} header={<Modal.Header>Legacy icon</Modal.Header>}>
      <Modal.Close ref={close}><svg data-testid="close-icon" /></Modal.Close>
    </Modal>,
  );
  expect(close.current).toBe(document.querySelector('svg'));
  act(() => close.current?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(changes).toHaveBeenCalledWith(false);
});

it('keeps the existing non-forwarding icon child usable when no ref is requested', () => {
  const errors = jest.spyOn(console, 'error');
  const changes = jest.fn();
  try {
    render(
      <Modal open onOpenChange={changes} header={<Modal.Header>Legacy icon</Modal.Header>}>
        <Modal.Close><Icon28Close className="legacy-close" style={{ color: 'rgb(1, 2, 3)' }} /></Modal.Close>
      </Modal>,
    );
    const icon = document.querySelector('svg')!;
    expect(icon.getAttribute('class')).toBe('legacy-close');
    expect(icon.style.color).toBe('rgb(1, 2, 3)');
    act(() => icon.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(changes.mock.calls).toEqual([[false]]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    errors.mockRestore();
  }
});

it('preserves preventDefault and controlled ownership of the open state', () => {
  const close = createRef<HTMLButtonElement>();
  const changes = jest.fn();
  const prevented = jest.fn((event) => event.preventDefault());
  const example = (cancel: boolean) => (
    <Modal open onOpenChange={changes} header={<Modal.Header>Controlled form</Modal.Header>}>
      <Modal.Close ref={close} onClick={cancel ? prevented : undefined}><button type="button">Close</button></Modal.Close>
    </Modal>
  );
  render(example(true));
  act(() => close.current?.click());
  expect(prevented).toHaveBeenCalledTimes(1);
  expect(changes).not.toHaveBeenCalled();
  render(example(false));
  act(() => close.current?.click());
  expect(changes.mock.calls).toEqual([[false]]);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
});
