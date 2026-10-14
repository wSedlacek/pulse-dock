import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Top padding for scroll content under the navigation chrome.
 *
 * - iOS: large-title header + contentInsetAdjustmentBehavior own the inset;
 *   only a small breathing gap is added.
 * - Web: DemoPhoneShell injects status-bar safe-area insets — honor them.
 * - Android: use the provider's top inset when the stack header is hidden.
 */
export function useScreenContentInsets() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'ios') {
    return { paddingTop: 8 };
  }

  return { paddingTop: insets.top + 8 };
}
