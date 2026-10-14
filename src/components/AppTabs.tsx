import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';

export default function AppTabs() {
  const { selectedIds } = useMusicStore();
  const { colors } = useTheme();

  const tint =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: '#2563EB', dark: '#4B8CFF' })
      : colors.accent;

  const labelColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({
          light: '#5B6F8C',
          dark: '#8FA4C2',
        })
      : colors.mist;

  return (
    <NativeTabs
      tintColor={tint}
      labelStyle={{ color: labelColor }}
      backgroundColor={
        Platform.OS === 'ios'
          ? DynamicColorIOS({ light: '#FFFFFF', dark: '#0A1528' })
          : colors.tabBar
      }
      badgeBackgroundColor={
        Platform.OS === 'ios'
          ? DynamicColorIOS({ light: '#2563EB', dark: '#4B8CFF' })
          : colors.accent
      }
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'music.note.list', selected: 'music.note.list' }}
          md="library_music"
        />
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        {selectedIds.length > 0 ? (
          <NativeTabs.Trigger.Badge>
            {selectedIds.length > 99 ? '99+' : String(selectedIds.length)}
          </NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="player">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'ipod',
            selected: 'ipod',
          }}
          md="devices"
        />
        <NativeTabs.Trigger.Label>Player</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sync">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'arrow.triangle.2.circlepath',
            selected: 'arrow.triangle.2.circlepath',
          }}
          md="sync"
        />
        <NativeTabs.Trigger.Label>Sync</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
