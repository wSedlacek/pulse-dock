import { Platform } from 'react-native';
import type { ThemeColors } from '../theme/colors';

/**
 * Native-feeling stack chrome.
 *
 * On iOS: transparent large-title header + system material.
 * On web/Android: hide the stack header (web uses LargeTitle polyfill;
 * DemoPhoneShell owns safe-area insets so navigators must not paint a second
 * white safe-area pad).
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
    ...(isIOS
      ? {}
      : {
          // Shell / system SafeAreaProvider already applied insets.
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
