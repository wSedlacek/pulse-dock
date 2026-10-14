import { Platform } from 'react-native';

/** Matches AppTabs.web StatusBarChrome / Dynamic Island clearance. */
export const WEB_STATUS_BAR_INSET = 54;

/**
 * Top padding for scroll content inside the web iPhone shell.
 * Hard-coded on web so we don't depend on nested SafeAreaProvider context
 * (which can miss screens when navigators wrap portals).
 * On iOS the stack large-title header + contentInsetAdjustmentBehavior handle this.
 */
export function usePhoneSafePadding() {
  if (Platform.OS !== 'web') {
    return { paddingTop: 8 };
  }
  return { paddingTop: WEB_STATUS_BAR_INSET + 8 };
}
