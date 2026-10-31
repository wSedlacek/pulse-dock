import { Platform, PlatformColor } from 'react-native';
import type { ThemeColors } from '../theme/colors';

/**
 * Stack chrome.
 *
 * On iOS: transparent large-title header so Liquid Glass / system material
 * draws. Avoid painting header backgrounds or blur overrides — those fight
 * UIKit on iOS 26+.
 *
 * On web/Android: hide the stack header (LargeTitle polyfill on web;
 * DemoPhoneShell owns safe-area insets).
 */
export function iosStackOptions(colors: ThemeColors) {
  const isIOS = Platform.OS === 'ios';

  return {
    headerShown: isIOS,
    headerLargeTitle: isIOS,
    headerTransparent: isIOS,
    headerShadowVisible: false,
    headerTintColor: isIOS ? PlatformColor('systemBlue') : colors.tint,
    ...(isIOS
      ? {}
      : {
          safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
        }),
    contentStyle: {
      backgroundColor: colors.groupedBackground,
      flex: 1,
    },
    headerBackTitle: 'Back',
  };
}
