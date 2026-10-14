export type ColorScheme = 'light' | 'dark';

/** iOS Human Interface–aligned palette (approximates system colors). */
export type ThemeColors = {
  /** systemGroupedBackground */
  groupedBackground: string;
  /** secondarySystemGroupedBackground */
  secondaryGrouped: string;
  /** tertiarySystemGroupedBackground */
  tertiaryGrouped: string;
  /** label */
  label: string;
  /** secondaryLabel */
  secondaryLabel: string;
  /** tertiaryLabel */
  tertiaryLabel: string;
  /** systemBlue */
  tint: string;
  /** systemRed */
  danger: string;
  /** systemOrange */
  orange: string;
  /** systemGreen */
  green: string;
  /** separator */
  separator: string;
  /** opaqueSeparator */
  opaqueSeparator: string;
  /** systemFill */
  fill: string;
  /** secondarySystemFill */
  secondaryFill: string;
  /** tab / nav bar surface */
  bar: string;
  /** Desk behind the web-only DemoPhoneShell (unused on native). */
  desk: string;
  /** filled button label */
  onTint: string;
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

export const palettes = { light, dark } as const;

/** Boot fallback before ThemeProvider mounts. */
export const colors = dark;
