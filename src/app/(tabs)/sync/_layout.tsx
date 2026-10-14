import { Stack } from 'expo-router';
import { iosStackOptions } from '../../../navigation/stackOptions';
import { useTheme } from '../../../theme/ThemeProvider';

export default function SyncStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={iosStackOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Sync' }} />
    </Stack>
  );
}
