'use client';

import { MutableRefObject, Ref, useMemo, useRef } from 'react';

import { multipleRef } from 'helpers/react/refs';

export function useExternRef<T>(
  ...externRefs: Array<Ref<T> | undefined | false>
): MutableRefObject<T | null> {
  const stableRef = useRef<T | null>(null);

  return useMemo(() => {
    const mergedRef = multipleRef(stableRef, ...externRefs);
    return {
      get current() {
        return stableRef.current;
      },
      set current(el) {
        mergedRef.current = el;
      },
    };
  }, externRefs);
}
