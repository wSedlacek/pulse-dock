import { Stack } from 'expo-router';
import { iosStackOptions } from '../../../navigation/stackOptions';
import { useTheme } from '../../../theme/ThemeProvider';

/** Anchor for deep links into this stack (SDK 58 unstable_settings.anchor). */
export const unstable_settings = {
  anchor: 'index',
};

export default function LibraryStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={iosStackOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Library' }} activityEnabled />
    </Stack>
  );
}
