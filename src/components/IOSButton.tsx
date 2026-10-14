import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Visual weight — mirrors UIKit button configurations.
   * Prefer one `filled` primary per screen.
   */
  variant?: 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive';
  /**
   * Control size — mirrors `.controlSize`:
   * large ≈ 50pt (full-width CTA), medium ≈ 44pt, small ≈ 34pt.
   */
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
};

const SIZE = {
  large: {
    minHeight: 50,
    radius: 12,
    padH: 16,
    label: typography.headline as TextStyle,
  },
  medium: {
    minHeight: 44,
    radius: 10,
    padH: 14,
    label: typography.body as TextStyle,
  },
  small: {
    minHeight: 34,
    radius: 8,
    padH: 12,
    label: { ...typography.subhead, fontWeight: '600' } as TextStyle,
  },
} as const;

export function IOSButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'filled',
  size = 'medium',
  style,
}: Props) {
  const { colors } = useTheme();
  const metrics = SIZE[size];

  const bg =
    variant === 'filled'
      ? colors.tint
      : variant === 'tinted'
        ? colors.secondaryFill
        : variant === 'gray'
          ? colors.fill
          : variant === 'destructive'
            ? colors.secondaryFill
            : 'transparent';

  const fg =
    variant === 'filled'
      ? colors.onTint
      : variant === 'destructive'
        ? colors.danger
        : colors.tint;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        if (Platform.OS === 'ios') {
          void Haptics.selectionAsync();
        }
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          minHeight: metrics.minHeight,
          borderRadius: metrics.radius,
          paddingHorizontal: metrics.padH,
          opacity: pressed || disabled || loading ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[metrics.label, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
