import { Stack } from 'expo-router';
import { iosStackOptions } from '../../../navigation/stackOptions';
import { useTheme } from '../../../theme/ThemeProvider';

export const unstable_settings = {
  anchor: 'index',
};

export default function PlayerStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={iosStackOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Player' }} activityEnabled />
    </Stack>
  );
}
