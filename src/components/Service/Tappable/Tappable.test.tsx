import { PointerEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useRipple } from './components/Ripple/hooks/useRipple';
import { Tappable, TappableProps } from './Tappable';

jest.mock('./Tappable.module.css', () => ({}));
jest.mock('hooks/usePlatform', () => ({ usePlatform: () => 'base' }));
jest.mock('./components/Ripple/hooks/useRipple');
jest.mock('./components/Ripple/Ripple', () => ({ Ripple: () => null }));

describe('Tappable pointer handlers', () => {
  const rippleDown = jest.fn();
  const rippleCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRipple).mockReturnValue({
      clicks: [],
      onPointerDown: rippleDown,
      onPointerCancel: rippleCancel,
    });
  });

  const renderHandlers = (props: TappableProps) => {
    const root = jest.fn((rootProps: TappableProps) => <div>{rootProps.children}</div>);
    renderToStaticMarkup(<Tappable {...props} Component={root} />);
    return root.mock.calls[0][0];
  };

  it.each(['onPointerDown', 'onPointerCancel'] as const)(
    '%s calls both the ripple and user handlers with the original event',
    (handlerName) => {
      const userHandler = jest.fn();
      const event = {} as PointerEvent<HTMLElement>;
      const handlers = renderHandlers({ [handlerName]: userHandler });

      handlers[handlerName]!(event);

      const rippleHandler = handlerName === 'onPointerDown' ? rippleDown : rippleCancel;
      expect(rippleHandler).toHaveBeenCalledTimes(1);
      expect(rippleHandler).toHaveBeenCalledWith(event);
      expect(userHandler).toHaveBeenCalledTimes(1);
      expect(userHandler).toHaveBeenCalledWith(event);
    },
  );

  it('keeps ripple handlers working without user handlers', () => {
    const event = {} as PointerEvent<HTMLElement>;
    const handlers = renderHandlers({});

    handlers.onPointerDown!(event);
    handlers.onPointerCancel!(event);

    expect(rippleDown).toHaveBeenCalledWith(event);
    expect(rippleCancel).toHaveBeenCalledWith(event);
  });

  it('passes onPointerUp through unchanged', () => {
    const onPointerUp = jest.fn();
    const handlers = renderHandlers({ onPointerUp });

    expect(handlers.onPointerUp).toBe(onPointerUp);
  });
});
