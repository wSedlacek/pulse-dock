import { Platform, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

/**
 * Web polyfill for UIKit large titles (headerLargeTitle is iOS-only).
 * Renders nothing on native — not part of the demo phone chrome.
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
