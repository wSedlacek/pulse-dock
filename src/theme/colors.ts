import { DynamicColorIOS, Platform, PlatformColor, type ColorValue } from 'react-native';

export type ColorScheme = 'light' | 'dark';

/** iOS Human Interface–aligned palette. On iOS, prefer live system colors. */
export type ThemeColors = {
  groupedBackground: ColorValue;
  secondaryGrouped: ColorValue;
  tertiaryGrouped: ColorValue;
  label: ColorValue;
  secondaryLabel: ColorValue;
  tertiaryLabel: ColorValue;
  tint: ColorValue;
  danger: ColorValue;
  orange: ColorValue;
  green: ColorValue;
  separator: ColorValue;
  opaqueSeparator: ColorValue;
  fill: ColorValue;
  secondaryFill: ColorValue;
  bar: ColorValue;
  /** Desk behind the web-only DemoPhoneShell (unused on native). */
  desk: ColorValue;
  onTint: ColorValue;
};

const light: ThemeColors = {
  groupedBackground: '#F2F2F7',
  secondaryGrouped: '#FFFFFF',
  tertiaryGrouped: '#FFFFFF',
  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.60)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.30)',
  tint: '#007AFF',
  danger: '#FF3B30',
  orange: '#FF9500',
  green: '#34C759',
  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',
  fill: 'rgba(120, 120, 128, 0.20)',
  secondaryFill: 'rgba(120, 120, 128, 0.16)',
  bar: 'rgba(249, 249, 249, 0.94)',
  desk: '#E5E5EA',
  onTint: '#FFFFFF',
};

const dark: ThemeColors = {
  groupedBackground: '#000000',
  secondaryGrouped: '#1C1C1E',
  tertiaryGrouped: '#2C2C2E',
  label: '#FFFFFF',
  secondaryLabel: 'rgba(235, 235, 245, 0.60)',
  tertiaryLabel: 'rgba(235, 235, 245, 0.30)',
  tint: '#0A84FF',
  danger: '#FF453A',
  orange: '#FF9F0A',
  green: '#30D158',
  separator: 'rgba(84, 84, 88, 0.65)',
  opaqueSeparator: '#38383A',
  fill: 'rgba(120, 120, 128, 0.36)',
  secondaryFill: 'rgba(120, 120, 128, 0.32)',
  bar: 'rgba(28, 28, 30, 0.94)',
  desk: '#1C1C1E',
  onTint: '#FFFFFF',
};

/** Live UIKit system colors — Liquid Glass chrome resolves against these. */
function iosSystemColors(): ThemeColors {
  return {
    groupedBackground: PlatformColor('systemGroupedBackground'),
    secondaryGrouped: PlatformColor('secondarySystemGroupedBackground'),
    tertiaryGrouped: PlatformColor('tertiarySystemGroupedBackground'),
    label: PlatformColor('label'),
    secondaryLabel: PlatformColor('secondaryLabel'),
    tertiaryLabel: PlatformColor('tertiaryLabel'),
    tint: PlatformColor('systemBlue'),
    danger: PlatformColor('systemRed'),
    orange: PlatformColor('systemOrange'),
    green: PlatformColor('systemGreen'),
    separator: PlatformColor('separator'),
    opaqueSeparator: PlatformColor('opaqueSeparator'),
    fill: PlatformColor('systemFill'),
    secondaryFill: PlatformColor('secondarySystemFill'),
    bar: DynamicColorIOS({
      light: 'rgba(249, 249, 249, 0.94)',
      dark: 'rgba(28, 28, 30, 0.94)',
    }),
    desk: PlatformColor('systemGray5'),
    onTint: '#FFFFFF',
  };
}

export const palettes = { light, dark } as const;

export function colorsForScheme(scheme: ColorScheme): ThemeColors {
  if (Platform.OS === 'ios') {
    return iosSystemColors();
  }
  return palettes[scheme];
}

/** Boot fallback before ThemeProvider mounts. */
export const colors = dark;
