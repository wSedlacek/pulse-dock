import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';
import {
  DEMO_HOME_INDICATOR_INSET,
  DEMO_PHONE_HEIGHT,
  DEMO_PHONE_INNER_HEIGHT,
  DEMO_PHONE_INNER_WIDTH,
  DEMO_PHONE_WIDTH,
  DEMO_STATUS_BAR_INSET,
} from './phoneMetrics';

/**
 * Web-only injection: centered iPhone frame + fake status bar / home indicator.
 * Nested SafeAreaProvider publishes phone insets so the real app (tabs, screens)
 * can use useSafeAreaInsets() the same way it would on device.
 */
export function DemoPhoneShell({ children }: { children: ReactNode }) {
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  return (
    <View
      style={[
        styles.desk,
        {
          backgroundColor: colors.desk,
          minHeight: windowHeight,
          width: windowWidth,
        },
      ]}
    >
      <View
        style={[
          styles.phone,
          {
            backgroundColor: colors.groupedBackground,
            borderColor: isDark ? '#2C2C2E' : '#1C1C1E',
          },
        ]}
      >
        <SafeAreaProvider
          initialMetrics={{
            frame: {
              x: 0,
              y: 0,
              width: DEMO_PHONE_INNER_WIDTH,
              height: DEMO_PHONE_INNER_HEIGHT,
            },
            insets: {
              top: DEMO_STATUS_BAR_INSET,
              right: 0,
              bottom: DEMO_HOME_INDICATOR_INSET,
              left: 0,
            },
          }}
        >
          <View style={styles.screen}>{children}</View>
        </SafeAreaProvider>

        <StatusBarChrome />
        <View
          pointerEvents="none"
          style={[styles.homeIndicator, { backgroundColor: colors.label }]}
        />
      </View>
    </View>
  );
}

function StatusBarChrome() {
  const { colors, isDark } = useTheme();
  const time = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.statusBar, { backgroundColor: colors.groupedBackground }]}
    >
      <Text style={[typography.caption1, { color: colors.label, fontWeight: '600' }]}>
        {time}
      </Text>
      <View style={[styles.island, { backgroundColor: isDark ? '#000' : '#111' }]} />
      <View style={styles.statusIcons}>
        <View style={[styles.signal, { backgroundColor: colors.label }]} />
        <View style={[styles.wifi, { borderColor: colors.label }]} />
        <View style={[styles.battery, { borderColor: colors.label }]}>
          <View style={[styles.batteryFill, { backgroundColor: colors.label }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desk: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  phone: {
    width: DEMO_PHONE_WIDTH,
    height: DEMO_PHONE_HEIGHT,
    maxHeight: '96%',
    borderRadius: 47,
    borderWidth: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
  screen: {
    flex: 1,
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: DEMO_STATUS_BAR_INSET,
    paddingHorizontal: 28,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  island: {
    position: 'absolute',
    top: 11,
    left: (DEMO_PHONE_WIDTH - 126) / 2 - 12,
    width: 126,
    height: 37,
    borderRadius: 20,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signal: {
    width: 16,
    height: 10,
    borderRadius: 2,
    opacity: 0.9,
  },
  wifi: {
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 8,
    opacity: 0.9,
  },
  battery: {
    width: 22,
    height: 11,
    borderWidth: 1.2,
    borderRadius: 3,
    padding: 1.5,
    opacity: 0.9,
  },
  batteryFill: {
    flex: 1,
    borderRadius: 1,
    width: '70%',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    left: (DEMO_PHONE_WIDTH - 134) / 2 - 12,
    width: 134,
    height: 5,
    borderRadius: 3,
    opacity: 0.9,
    zIndex: 30,
  },
});
