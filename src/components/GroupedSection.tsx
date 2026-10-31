import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

type Props = {
  header?: string;
  footer?: string;
  children: ReactNode;
};

export function GroupedSection({ header, footer, children }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {header ? (
        <Text
          accessibilityRole="header"
          style={[typography.footnote, styles.header, { color: colors.secondaryLabel }]}
        >
          {header.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.secondaryGrouped,
          },
        ]}
      >
        {children}
      </View>
      {footer ? (
        <Text style={[typography.footnote, styles.footer, { color: colors.secondaryLabel }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  footer: {
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 18,
  },
});
