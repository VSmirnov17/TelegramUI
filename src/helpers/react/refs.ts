import { MutableRefObject, Ref } from 'react';

/** Attach a ref and return its matching detach operation. */
export const setRef = <T>(element: T | null, ref?: Ref<T>): (() => void) => {
  if (typeof ref === 'function') {
    // React 18 types accept void callbacks; React 19 also accepts cleanup.
    const cleanup: unknown = ref(element);
    return typeof cleanup === 'function' ? () => { cleanup(); } : () => { ref(null); };
  }

  if (ref) {
    // eslint-disable-next-line no-param-reassign
    (ref as MutableRefObject<T | null>).current = element;
  }
  return () => {
    if (ref) {
      // eslint-disable-next-line no-param-reassign
      (ref as MutableRefObject<T | null>).current = null;
    }
  };
};

export const multipleRef = <T>(...refs: Array<Ref<T> | undefined | false>): MutableRefObject<T | null> => {
  let current: T | null = null;
  let detach: Array<() => void> = [];
  return {
    get current() {
      return current;
    },
    set current(element) {
      detach.forEach((cleanup) => cleanup());
      detach = [];
      current = element;
      if (element !== null) {
        detach = refs.map((ref) => setRef(element, ref || undefined));
      }
    },
  };
};
