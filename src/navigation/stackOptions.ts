import { Platform } from 'react-native';
import type { ThemeColors } from '../theme/colors';

export function iosStackOptions(colors: ThemeColors) {
  return {
    headerLargeTitle: true,
    headerTransparent: Platform.OS === 'ios',
    headerBlurEffect: Platform.OS === 'ios' ? ('systemChromeMaterial' as const) : undefined,
    headerShadowVisible: false,
    headerTintColor: colors.tint,
    headerLargeTitleStyle: {
      color: colors.label,
    },
    headerTitleStyle: {
      color: colors.label,
      fontWeight: '600' as const,
    },
    headerStyle: {
      backgroundColor: Platform.OS === 'ios' ? undefined : colors.groupedBackground,
    },
    contentStyle: {
      backgroundColor: colors.groupedBackground,
    },
    headerBackTitle: 'Back',
  };
}
