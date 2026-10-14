import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function BrandHeader({ eyebrow = 'PulseDock', title, subtitle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.brand, { color: colors.accent }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.chalk }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mist }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 20,
  },
  brand: {
    fontFamily: 'Syne_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
  },
});
