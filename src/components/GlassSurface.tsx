import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Interactive glass (buttons / controls). */
  interactive?: boolean;
  glassEffectStyle?: 'regular' | 'clear';
};

/**
 * Liquid Glass surface on iOS 26+; falls back to a translucent material elsewhere.
 * Use for custom chrome — system tab/nav bars already draw glass themselves.
 */
export function GlassSurface({
  children,
  style,
  interactive = false,
  glassEffectStyle = 'regular',
}: Props) {
  const { colors, isDark } = useTheme();
  const canUseNativeGlass =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  if (canUseNativeGlass) {
    return (
      <GlassView
        style={[styles.base, style]}
        glassEffectStyle={glassEffectStyle}
        isInteractive={interactive}
        colorScheme={isDark ? 'dark' : 'light'}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        {
          backgroundColor: isDark ? 'rgba(28,28,30,0.72)' : 'rgba(255,255,255,0.72)',
          borderColor: colors.separator,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  fallback: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
