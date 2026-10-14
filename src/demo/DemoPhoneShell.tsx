import type { ReactNode } from 'react';

/**
 * Native / non-web: the real app has no demo chrome.
 * Safe areas come from the device via the root SafeAreaProvider.
 */
export function DemoPhoneShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
