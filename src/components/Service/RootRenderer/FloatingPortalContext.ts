import { createContext } from 'react';

// Undefined uses the AppRoot portal; null waits for the local container to mount.
export const FloatingPortalContext = createContext<HTMLDivElement | null | undefined>(undefined);
