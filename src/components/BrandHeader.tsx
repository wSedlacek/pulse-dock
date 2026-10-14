import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function BrandHeader({ eyebrow = 'PulseDock', title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
    color: colors.led,
  },
  title: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 18,
    color: colors.chalk,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.mist,
    maxWidth: 340,
  },
});
