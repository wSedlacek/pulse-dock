import { Platform } from 'react-native';
import type { ThemeColors } from '../theme/colors';

/**
 * Native-feeling stack chrome.
 *
 * On iOS: transparent large-title header + system material so content blends
 * under the status bar (no hard white slab).
 *
 * On web: hide the stack header entirely. The phone-shell SafeAreaProvider
 * supplies insets and screens render a LargeTitle in content — otherwise
 * react-navigation paints an opaque white header band under our status chrome.
 */
export function iosStackOptions(colors: ThemeColors) {
  const isIOS = Platform.OS === 'ios';

  return {
    headerShown: isIOS,
    headerLargeTitle: isIOS,
    headerTransparent: isIOS,
    headerBlurEffect: isIOS ? ('systemChromeMaterial' as const) : undefined,
    headerShadowVisible: false,
    headerTintColor: colors.tint,
    headerLargeTitleStyle: {
      color: colors.label,
    },
    headerTitleStyle: {
      color: colors.label,
      fontWeight: '600' as const,
    },
    headerLargeStyle: {
      backgroundColor: colors.groupedBackground,
    },
    headerStyle: {
      backgroundColor: isIOS ? 'transparent' : colors.groupedBackground,
    },
    contentStyle: {
      backgroundColor: colors.groupedBackground,
    },
    headerBackTitle: 'Back',
  };
}
