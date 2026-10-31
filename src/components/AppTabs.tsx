import { PlatformColor } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { useMusicStore } from '../store/MusicStore';

/**
 * Native tabs — leave appearance to the system so iOS 26+ draws Liquid Glass.
 * Do not set backgroundColor / blurEffect / disableTransparentOnScrollEdge;
 * those fight UIKit on iOS 26 and only mattered on older OS versions.
 */
export default function AppTabs() {
  const { selectedIds } = useMusicStore();

  return (
    <NativeTabs
      tintColor={PlatformColor('systemBlue')}
      minimizeBehavior="automatic"
    >
      <NativeTabs.Trigger name="library">
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

      <NativeTabs.Trigger name="player">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'ipod', selected: 'ipod' }}
          md={{ default: 'devices', selected: 'devices' }}
        />
        <NativeTabs.Trigger.Label>Player</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sync">
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
