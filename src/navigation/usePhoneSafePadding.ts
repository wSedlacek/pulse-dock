import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Top padding for scroll content inside the web iPhone shell.
 * On iOS the stack large-title header + contentInsetAdjustmentBehavior handle this.
 */
export function usePhoneSafePadding() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') {
    return { paddingTop: 8 };
  }
  return { paddingTop: insets.top + 4 };
}
