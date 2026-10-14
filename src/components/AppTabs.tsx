import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';

/** Stable Native Tabs API (SDK 58+). */
export default function AppTabs() {
  const { selectedIds } = useMusicStore();
  const { colors } = useTheme();

  const tint =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: '#007AFF', dark: '#0A84FF' })
      : colors.tint;

  const labelColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({
          light: 'rgba(60, 60, 67, 0.60)',
          dark: 'rgba(235, 235, 245, 0.60)',
        })
      : colors.secondaryLabel;

  return (
    <NativeTabs
      tintColor={tint}
      labelStyle={{
        fontSize: 10,
        fontWeight: '500',
        color: labelColor,
      }}
      blurEffect="systemDefault"
      backgroundColor={
        Platform.OS === 'ios'
          ? DynamicColorIOS({
              light: 'rgba(255,255,255,0.0)',
              dark: 'rgba(0,0,0,0.0)',
            })
          : colors.bar
      }
      badgeBackgroundColor={tint}
      minimizeBehavior="automatic"
    >
      <NativeTabs.Trigger name="library" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'music.note.list', selected: 'music.note.list' }}
          md={{ default: 'library_music', selected: 'library_music' }}
        />
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        {selectedIds.length > 0 ? (
          <NativeTabs.Trigger.Badge>
            {selectedIds.length > 99 ? '99+' : String(selectedIds.length)}
          </NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="player" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'ipod', selected: 'ipod' }}
          md={{ default: 'devices', selected: 'devices' }}
        />
        <NativeTabs.Trigger.Label>Player</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sync" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'arrow.triangle.2.circlepath',
            selected: 'arrow.triangle.2.circlepath',
          }}
          md={{ default: 'sync', selected: 'sync' }}
        />
        <NativeTabs.Trigger.Label>Sync</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
