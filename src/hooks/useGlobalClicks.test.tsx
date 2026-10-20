import { createRef } from 'react';
import { renderToString } from 'react-dom/server';

import { useGlobalClicks } from './useGlobalClicks';

it('renders on the server without reading document or invoking the outside click callback', () => {
  const callback = jest.fn();
  const Probe = () => {
    useGlobalClicks(callback, createRef<HTMLDivElement>());
    return <span>Server content</span>;
  };

  expect(() => renderToString(<Probe />)).not.toThrow();
  expect(renderToString(<Probe />)).toBe('<span>Server content</span>');
  expect(callback).not.toHaveBeenCalled();
});
