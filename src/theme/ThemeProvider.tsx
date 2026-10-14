import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type ColorScheme, type ThemeColors } from './colors';

type ThemeValue = {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'light' ? 'light' : 'dark';
  const colors = palettes[scheme];
  const isDark = scheme === 'dark';

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.groupedBackground);
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
