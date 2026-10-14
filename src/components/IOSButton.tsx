import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
  style?: ViewStyle;
};

export function IOSButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'filled',
  style,
}: Props) {
  const { colors } = useTheme();

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
        { backgroundColor: bg, opacity: pressed || disabled || loading ? 0.55 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[typography.headline, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
