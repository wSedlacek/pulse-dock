import { Platform, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

/**
 * Web stand-in for UIKit large titles (headerLargeTitle only works on iOS).
 * Renders nothing on native so the stack header owns the title.
 */
export function LargeTitle({ children }: { children: string }) {
  const { colors } = useTheme();
  if (Platform.OS !== 'web') return null;

  return (
    <Text
      accessibilityRole="header"
      style={[typography.largeTitle, styles.title, { color: colors.label }]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
    paddingTop: 4,
  },
});
