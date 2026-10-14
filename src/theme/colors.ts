export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  ink: string;
  inkElevated: string;
  inkSoft: string;
  mist: string;
  chalk: string;
  chalkDim: string;
  accent: string;
  accentDim: string;
  accentContrast: string;
  amber: string;
  danger: string;
  line: string;
  glow: string;
  washTop: string;
  washMid: string;
  washBottom: string;
  tabBar: string;
  desk: string;
  orbA: string;
  orbB: string;
};

const dark: ThemeColors = {
  ink: '#071225',
  inkElevated: '#0E1C33',
  inkSoft: '#162744',
  mist: '#8FA4C2',
  chalk: '#EAF1FB',
  chalkDim: '#B4C4DB',
  accent: '#4B8CFF',
  accentDim: '#2F6FD6',
  accentContrast: '#FFFFFF',
  amber: '#E8A54B',
  danger: '#FF6B6B',
  line: 'rgba(234, 241, 251, 0.10)',
  glow: 'rgba(75, 140, 255, 0.16)',
  washTop: '#16325A',
  washMid: '#0C1C34',
  washBottom: '#050B16',
  tabBar: '#0A1528',
  desk: '#040910',
  orbA: 'rgba(75, 140, 255, 0.14)',
  orbB: 'rgba(120, 170, 255, 0.08)',
};

const light: ThemeColors = {
  ink: '#F3F7FD',
  inkElevated: '#FFFFFF',
  inkSoft: '#E7EEF9',
  mist: '#5B6F8C',
  chalk: '#10213A',
  chalkDim: '#3D516C',
  accent: '#2563EB',
  accentDim: '#1D4ED8',
  accentContrast: '#FFFFFF',
  amber: '#C67A1A',
  danger: '#DC3D3D',
  line: 'rgba(16, 33, 58, 0.10)',
  glow: 'rgba(37, 99, 235, 0.10)',
  washTop: '#DCE8FA',
  washMid: '#EEF3FB',
  washBottom: '#F7FAFE',
  tabBar: '#FFFFFF',
  desk: '#D5DEEC',
  orbA: 'rgba(37, 99, 235, 0.10)',
  orbB: 'rgba(96, 165, 250, 0.12)',
};

export const palettes = { light, dark } as const;

/** @deprecated Prefer useTheme().colors — kept for boot screens before provider mounts. */
export const colors = dark;
