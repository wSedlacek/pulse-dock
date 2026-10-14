import { Platform } from 'react-native';
import type { ThemeColors } from '../theme/colors';

/**
 * Native-feeling stack chrome.
 *
 * On iOS: transparent large-title header + system material so content blends
 * under the status bar (no hard white slab).
 *
 * On web: hide the stack header and zero out navigator safe-area insets.
 * react-navigation's default SafeAreaView uses a white background — that was
 * the hard cut under the status icons. The phone shell owns insets instead.
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
    // Prevent the navigator from painting a white safe-area pad on web.
    ...(isIOS
      ? {}
      : {
          safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
        }),
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
      flex: 1,
    },
    headerBackTitle: 'Back',
  };
}
