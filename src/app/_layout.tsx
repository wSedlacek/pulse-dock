import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoPhoneShell } from '../demo/DemoPhoneShell';
import { MusicStoreProvider, useMusicStore } from '../store/MusicStore';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { ready } = useMusicStore();

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1, backgroundColor: colors.groupedBackground },
        }}
      >
        <Stack.Screen name="(tabs)" activityEnabled />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <MusicStoreProvider>
            <DemoPhoneShell>
              <RootNavigator />
            </DemoPhoneShell>
          </MusicStoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
