import { renderToString } from 'react-dom/server';

import { useAppRootContext } from 'hooks/useAppRootContext';
import { AppRoot } from './AppRoot';
import { getInitialAppearance } from './hooks/helpers/getInitialAppearance';
import { getInitialPlatform } from './hooks/helpers/getInitialPlatform';

jest.mock('./AppRoot.module.css', () => ({
  wrapper: 'root',
  'wrapper--ios': 'ios',
  'wrapper--dark': 'dark',
}));
jest.mock('./hooks/helpers/getInitialAppearance');
jest.mock('./hooks/helpers/getInitialPlatform');

const ContextValue = () => {
  const { platform, appearance } = useAppRootContext();
  return <span>{platform}/{appearance}</span>;
};

describe('AppRoot server rendering', () => {
  beforeEach(() => {
    jest.mocked(getInitialPlatform).mockReturnValue('ios');
    jest.mocked(getInitialAppearance).mockReturnValue('dark');
  });

  it('keeps automatic server markup independent of browser detection', () => {
    const clientEnvironment = renderToString(<AppRoot><ContextValue /></AppRoot>);

    jest.mocked(getInitialPlatform).mockReturnValue('base');
    jest.mocked(getInitialAppearance).mockReturnValue('light');
    const serverEnvironment = renderToString(<AppRoot><ContextValue /></AppRoot>);

    expect(clientEnvironment).toBe(serverEnvironment);
    expect(serverEnvironment).toBe('<div class="root"><span>base<!-- -->/<!-- -->light</span></div>');
  });

  it('renders explicit platform and appearance on the server', () => {
    const html = renderToString(<AppRoot platform="ios" appearance="dark"><ContextValue /></AppRoot>);

    expect(html).toContain('class="root ios dark"');
    expect(html).toContain('ios<!-- -->/<!-- -->dark');
  });

  it('inherits explicit parent settings in nested roots', () => {
    const html = renderToString(
      <AppRoot platform="ios" appearance="dark">
        <AppRoot><ContextValue /></AppRoot>
      </AppRoot>,
    );

    expect(html.match(/class="root ios dark"/g)).toHaveLength(2);
    expect(html).toContain('ios<!-- -->/<!-- -->dark');
  });

  it('lets nested roots override inherited settings', () => {
    const html = renderToString(
      <AppRoot platform="ios" appearance="dark">
        <AppRoot platform="base" appearance="light"><ContextValue /></AppRoot>
      </AppRoot>,
    );

    expect(html).toContain('<div class="root ios dark"><div class="root">');
    expect(html).toContain('base<!-- -->/<!-- -->light');
  });
});
