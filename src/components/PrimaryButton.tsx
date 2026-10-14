import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 260 });
      }}
      onPress={onPress}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.led : colors.ink} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'ghost' && styles.ghostLabel,
            variant === 'danger' && styles.dangerLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.led,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  danger: {
    backgroundColor: 'rgba(255, 107, 107, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.35)',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 15,
    color: colors.ink,
  },
  ghostLabel: {
    color: colors.chalk,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
