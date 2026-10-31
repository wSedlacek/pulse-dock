import {
  ActivityIndicator,
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
  variant?: 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive';
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
    minHeight: 44,
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
  const busy = !!loading;
  const inactive = !!disabled || busy;

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
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          minHeight: metrics.minHeight,
          borderRadius: metrics.radius,
          paddingHorizontal: metrics.padH,
          opacity: inactive ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg as string} />
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
