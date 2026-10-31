import { Platform } from 'react-native';

/**
 * Demo player / sample library controls belong in the web preview and
 * local __DEV__ builds — not production native releases.
 */
export const SHOW_DEMO_CONTROLS =
  Platform.OS === 'web' || (typeof __DEV__ !== 'undefined' && __DEV__);
