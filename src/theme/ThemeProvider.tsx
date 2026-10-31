import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { Platform, useColorScheme } from 'react-native';
import {
  colorsForScheme,
  type ColorScheme,
  type ThemeColors,
} from './colors';

type ThemeValue = {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'light' ? 'light' : 'dark';
  const colors = colorsForScheme(scheme);
  const isDark = scheme === 'dark';

  useEffect(() => {
    // SystemUI expects a concrete color; on iOS the window already follows
    // systemGroupedBackground via the native chrome.
    if (Platform.OS === 'ios') return;
    const bg = typeof colors.groupedBackground === 'string' ? colors.groupedBackground : null;
    if (bg) void SystemUI.setBackgroundColorAsync(bg);
  }, [colors.groupedBackground]);

  const value = useMemo(
    () => ({ scheme, colors, isDark }),
    [scheme, colors, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
