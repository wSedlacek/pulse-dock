import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { Syne_700Bold } from '@expo-google-fonts/syne';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MusicStoreProvider } from '../store/MusicStore';
import { colors } from '../theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.led} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <MusicStoreProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: styles.flex }} />
        </MusicStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  boot: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
