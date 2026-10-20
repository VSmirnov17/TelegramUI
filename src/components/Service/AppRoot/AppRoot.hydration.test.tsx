/** @jest-environment jsdom */

import { ReactElement } from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';

import { useAppRootContext } from 'hooks/useAppRootContext';

import { AppRoot } from './AppRoot';

jest.mock('./AppRoot.module.css', () => ({
  wrapper: 'root',
  'wrapper--ios': 'ios',
  'wrapper--dark': 'dark',
  'wrapper--ignore-telegram-theme': 'library-colors',
}));
// The browser server-rendering entry needs TextEncoder, which jsdom does not expose.
jest.mock('react-dom/server', () => jest.requireActual('react-dom/server.node'));

const ContextValue = () => {
  const { platform, appearance } = useAppRootContext();
  return <span data-context>{platform}/{appearance}</span>;
};

describe('AppRoot hydration', () => {
  let container: HTMLDivElement;
  let root: Root | undefined;
  let consoleError: jest.SpyInstance;
  let consoleWarn: jest.SpyInstance;
  const recoverableError = jest.fn();
  const themeListeners = new Set<() => void>();
  const onEvent = jest.fn((event: string, listener: () => void) => {
    expect(event).toBe('themeChanged');
    themeListeners.add(listener);
  });
  const offEvent = jest.fn((event: string, listener: () => void) => {
    expect(event).toBe('themeChanged');
    themeListeners.delete(listener);
  });

  const connectTelegram = () => {
    window.Telegram = {
      WebApp: { platform: 'ios', colorScheme: 'dark', onEvent, offEvent },
    } as unknown as Window['Telegram'];
  };

  const hydrate = async (element: ReactElement) => {
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: recoverableError });
    });
  };

  const changeTheme = async () => {
    window.Telegram!.WebApp.colorScheme = 'light';
    await act(async () => {
      themeListeners.forEach((listener) => listener());
    });
  };

  beforeEach(() => {
    Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true });
    delete window.Telegram;
    jest.clearAllMocks();
    themeListeners.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    try {
      await act(async () => root?.unmount());
      expect(themeListeners.size).toBe(0);
      expect(offEvent.mock.calls).toEqual(onEvent.mock.calls);
      expect(recoverableError).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(consoleWarn).not.toHaveBeenCalled();
    } finally {
      root = undefined;
      container.remove();
      delete window.Telegram;
      delete (global as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
      consoleError.mockRestore();
      consoleWarn.mockRestore();
    }
  });

  it('hydrates base/light markup before detecting ios/dark, preserving DOM, input and focus', async () => {
    const element = (
      <AppRoot>
        <ContextValue />
        <input aria-label="Draft" defaultValue="Server draft" />
      </AppRoot>
    );
    container.innerHTML = renderToString(element);
    const wrapper = container.firstElementChild;
    const context = container.querySelector('[data-context]');
    const input = container.querySelector('input')!;
    expect(wrapper?.className).toBe('root');
    expect(context?.textContent).toBe('base/light');
    input.value = 'Draft typed before hydration';
    input.focus();
    input.setSelectionRange(6, 11);

    connectTelegram();
    await hydrate(element);

    expect(container.firstElementChild).toBe(wrapper);
    expect(container.querySelector('[data-context]')).toBe(context);
    expect(container.querySelector('input')).toBe(input);
    expect(wrapper?.className).toBe('root ios dark');
    expect(context?.textContent).toBe('ios/dark');
    expect(input.value).toBe('Draft typed before hydration');
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([6, 11]);
    expect(onEvent).toHaveBeenCalledTimes(1);

    await changeTheme();
    expect(wrapper?.className).toBe('root ios');
    expect(context?.textContent).toBe('ios/light');
  });

  it('updates inherited settings while preserving explicit nested overrides', async () => {
    const element = (
      <AppRoot>
        <AppRoot data-testid="inherited"><ContextValue /></AppRoot>
        <AppRoot platform="base" appearance="light" data-testid="override"><ContextValue /></AppRoot>
      </AppRoot>
    );
    container.innerHTML = renderToString(element);
    const inherited = container.querySelector('[data-testid="inherited"]');
    const override = container.querySelector('[data-testid="override"]');
    expect(inherited?.textContent).toBe('base/light');
    expect(override?.textContent).toBe('base/light');

    connectTelegram();
    await hydrate(element);

    expect(container.querySelector('[data-testid="inherited"]')).toBe(inherited);
    expect(container.querySelector('[data-testid="override"]')).toBe(override);
    expect(inherited?.className).toBe('root ios dark');
    expect(inherited?.textContent).toBe('ios/dark');
    expect(override?.className).toBe('root');
    expect(override?.textContent).toBe('base/light');
    expect(onEvent).toHaveBeenCalledTimes(1);

    await changeTheme();
    expect(inherited?.className).toBe('root ios');
    expect(inherited?.textContent).toBe('ios/light');
    expect(override?.textContent).toBe('base/light');
  });

  it('hydrates explicit settings and inheritance without subscribing to Telegram theme changes', async () => {
    const element = (
      <AppRoot platform="base" appearance="light">
        <AppRoot><ContextValue /></AppRoot>
        <AppRoot platform="ios" appearance="dark"><ContextValue /></AppRoot>
      </AppRoot>
    );
    container.innerHTML = renderToString(element);
    const serverMarkup = container.innerHTML;
    const wrappers = Array.from(container.querySelectorAll('div'));

    connectTelegram();
    await hydrate(element);
    await changeTheme();

    expect(container.innerHTML).toBe(serverMarkup);
    Array.from(container.querySelectorAll('div')).forEach((wrapper, index) => {
      expect(wrapper).toBe(wrappers[index]);
    });
    expect(Array.from(container.querySelectorAll('[data-context]'), (node) => node.textContent)).toEqual(['base/light', 'ios/dark']);
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('hydrates the library palette option, including inherited and explicit false roots', async () => {
    const tree = (ignoreTelegramTheme: boolean) => (
      <AppRoot appearance="light" ignoreTelegramTheme={ignoreTelegramTheme}>
        <AppRoot data-testid="palette-inherited"><ContextValue /></AppRoot>
        <AppRoot data-testid="palette-reset" ignoreTelegramTheme={false}><ContextValue /></AppRoot>
      </AppRoot>
    );
    const element = tree(true);
    container.innerHTML = renderToString(element);
    const inherited = container.querySelector('[data-testid="palette-inherited"]');
    const reset = container.querySelector('[data-testid="palette-reset"]');
    connectTelegram();
    await hydrate(element);

    expect(inherited?.className).toBe('root ios library-colors');
    expect(reset?.className).toBe('root ios');
    await act(async () => root!.render(tree(false)));
    expect(inherited?.className).toBe('root ios');
    expect(container.querySelector('[data-testid="palette-inherited"]')).toBe(inherited);
    expect(container.querySelector('[data-testid="palette-reset"]')).toBe(reset);
  });
});
