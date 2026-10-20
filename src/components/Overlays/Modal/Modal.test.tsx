/** @jest-environment jsdom */
import { createRef, ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { AppRoot } from 'components/Service/AppRoot/AppRoot';
import { Text } from 'components/Typography/Text/Text';
import { Modal } from './Modal';

let root: Root;
let container: HTMLDivElement;
const previousActEnvironment = Reflect.get(global, 'IS_REACT_ACT_ENVIRONMENT');

const render = (children: ReactNode, platform: 'base' | 'ios' = 'base') => {
  act(() => root.render(<AppRoot platform={platform} appearance="light">{children}</AppRoot>));
};

// Check the actual ARIA relationship rather than relying on Radix's development warnings:
// newer Radix versions no longer warn when a dialog has no title.
const labelledBy = (dialog: Element) => {
  const id = dialog.getAttribute('aria-labelledby');
  expect(id).toBeTruthy();
  const matches = document.querySelectorAll(`[id="${id}"]`);
  expect(matches).toHaveLength(1);
  return matches[0];
};

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

it.each(['base', 'ios'] as const)('names a %s modal from its Header children', (platform) => {
  render(<Modal open header={<Modal.Header>Payment details</Modal.Header>}>Review your payment.</Modal>, platform);
  const dialog = document.querySelector('[role="dialog"]')!;
  const title = labelledBy(dialog);
  expect(title.textContent).toBe('Payment details');
  expect(title.tagName).toBe('H2');
  expect(title.closest('header')).not.toBeNull();
});

it('connects custom title and description typography and forwards their refs', () => {
  const titleRef = createRef<HTMLHeadingElement>();
  const descriptionRef = createRef<HTMLParagraphElement>();
  render(
    <Modal open>
      <Modal.Title ref={titleRef} asChild><Text Component="h2">Notification settings</Text></Modal.Title>
      <Modal.Description ref={descriptionRef} asChild><Text Component="p">Choose when to be notified.</Text></Modal.Description>
    </Modal>,
  );
  const dialog = document.querySelector('[role="dialog"]')!;
  expect(labelledBy(dialog)).toBe(titleRef.current);
  expect(titleRef.current?.textContent).toBe('Notification settings');
  expect(descriptionRef.current?.tagName).toBe('P');
  expect(document.getElementById(dialog.getAttribute('aria-describedby')!)).toBe(descriptionRef.current);
  expect(descriptionRef.current?.textContent).toBe('Choose when to be notified.');
});

it('gives nested modals independent title and description IDs', () => {
  render(
    <Modal open header={<Modal.Header>Account settings</Modal.Header>}>
      <Modal.Description>Manage your account.</Modal.Description>
      <Modal nested open header={<Modal.Header>Delete account</Modal.Header>}>
        <Modal.Description>This action is permanent.</Modal.Description>
      </Modal>
    </Modal>,
  );
  const dialogs = [...document.querySelectorAll('[role="dialog"]')];
  expect(dialogs).toHaveLength(2);
  expect(dialogs.map((dialog) => labelledBy(dialog).textContent).sort()).toEqual(['Account settings', 'Delete account']);
  const descriptions = dialogs.map((dialog) => dialog.getAttribute('aria-describedby'));
  expect(new Set(descriptions).size).toBe(2);
  expect(dialogs.map((dialog) => [labelledBy(dialog).textContent, document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent]).sort()).toEqual([
    ['Account settings', 'Manage your account.'],
    ['Delete account', 'This action is permanent.'],
  ]);
});

it.each(['base', 'ios'] as const)('keeps standalone Header usable on %s without a dialog context', (platform) => {
  render(<Modal.Header before="Back" after="Close">Account settings</Modal.Header>, platform);
  expect(container.querySelector('header')).not.toBeNull();
  expect(container.querySelector('h2')).toBeNull();
  expect(container.querySelector('header')?.textContent).toBe(platform === 'ios' ? 'BackAccount settingsClose' : 'BackClose');
});

it('does not invent a title for an empty Header or a headerless dialog', () => {
  render(<Modal open header={<Modal.Header after="Close" />}>Provide a Modal.Title for this content.</Modal>);
  const dialog = document.querySelector('[role="dialog"]')!;
  expect(dialog.querySelector('h2')).toBeNull();
  expect(dialog.getAttribute('aria-labelledby')).toBeNull();
});

it('preserves an explicit aria-label while still rendering a semantic Header title', () => {
  render(<Modal open aria-label="Platform form" header={<Modal.Header>Choose platforms</Modal.Header>} />);
  const dialog = document.querySelector('[role="dialog"]')!;
  expect(dialog.getAttribute('aria-label')).toBe('Platform form');
  expect(dialog.getAttribute('aria-labelledby')).toBeNull();
  expect(dialog.querySelector('h2')?.textContent).toBe('Choose platforms');
});

it('preserves an explicit aria-labelledby even when an aria-label and Header are provided', () => {
  render(
    <>
      <span id="custom-dialog-title">Platform preferences</span>
      <Modal open aria-label="Platform form" aria-labelledby="custom-dialog-title" header={<Modal.Header>Choose platforms</Modal.Header>} />
    </>,
  );
  const dialog = document.querySelector('[role="dialog"]')!;
  expect(labelledBy(dialog).textContent).toBe('Platform preferences');
  expect(dialog.querySelector('h2')?.textContent).toBe('Choose platforms');
});
