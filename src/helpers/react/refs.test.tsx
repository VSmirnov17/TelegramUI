/** @jest-environment jsdom */
import { createRef, RefCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { useExternRef } from 'hooks/useExternalRefs';

import { multipleRef } from './refs';

const External = ({ callback }: { callback: RefCallback<HTMLDivElement> }) => {
  const ref = useExternRef(callback);
  return <div ref={ref} />;
};

// The wrapper is an object ref, so React itself cannot see the cleanup returned
// by a callback inside it. Test both React 18's null callback and React 19 cleanup.
describe.each(['multipleRef', 'useExternRef'])('%s lifecycle', (kind) => {
  let root: Root;
  let container: HTMLDivElement;
  const previousActEnvironment = Reflect.get(global, 'IS_REACT_ACT_ENVIRONMENT');
  beforeEach(() => {
    Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    if (previousActEnvironment === undefined) {
      Reflect.deleteProperty(global, 'IS_REACT_ACT_ENVIRONMENT');
    } else {
      Reflect.set(global, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment);
    }
  });

  const render = (callback: RefCallback<HTMLDivElement>) => {
    act(() => root.render(kind === 'multipleRef'
      ? <div ref={multipleRef(callback)} />
      : <External callback={callback} />));
  };

  it('runs returned cleanup exactly once on replacement and unmount', () => {
    const cleanFirst = jest.fn();
    const cleanSecond = jest.fn();
    const first = jest.fn(() => cleanFirst);
    const second = jest.fn(() => cleanSecond);
    render(first);
    const element = container.firstElementChild;
    expect(first).toHaveBeenCalledWith(element);
    render(second);
    expect(cleanFirst).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(element);
    act(() => root.render(null));
    expect(cleanFirst).toHaveBeenCalledTimes(1);
    expect(cleanSecond).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('continues passing null to callbacks without returned cleanup', () => {
    const first = jest.fn();
    const second = jest.fn();
    render(first);
    render(second);
    expect(first.mock.calls.map(([value]) => value)).toEqual([container.firstElementChild, null]);
    act(() => root.render(null));
    expect(second.mock.calls.map(([value]) => value)).toEqual([expect.any(HTMLDivElement), null]);
  });
});

it('resets object refs together with callback cleanup', () => {
  const object = createRef<HTMLDivElement>();
  const cleanup = jest.fn();
  const callback = jest.fn(() => cleanup);
  const merged = multipleRef(object, callback);
  const element = document.createElement('div');
  merged.current = element;
  expect(object.current).toBe(element);
  merged.current = null;
  expect(object.current).toBeNull();
  expect(cleanup).toHaveBeenCalledTimes(1);
  merged.current = null;
  expect(cleanup).toHaveBeenCalledTimes(1);
});
