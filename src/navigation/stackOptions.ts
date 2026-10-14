import { Platform } from 'react-native';
import type { ThemeColors } from '../theme/colors';

/**
 * Native-feeling stack chrome.
 *
 * - iOS: transparent + system material so content blends under the status bar
 *   (no hard white slab).
 * - Web (phone shell): opaque header painted with the same grouped background
 *   as the scene, so status chrome → title → content read as one surface.
 */
export function iosStackOptions(colors: ThemeColors) {
  const isIOS = Platform.OS === 'ios';

  return {
    // Large titles are a native UIKit feature; on web we render them in-screen.
    headerLargeTitle: isIOS,
    headerTransparent: isIOS,
    headerBlurEffect: isIOS ? ('systemChromeMaterial' as const) : undefined,
    headerShadowVisible: false,
    headerTintColor: colors.tint,
    // Hide the compact title on web — screens show a large title themselves.
    headerTitle: isIOS ? undefined : '',
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
