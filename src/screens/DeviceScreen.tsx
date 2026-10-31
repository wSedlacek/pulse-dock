import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { GroupedSection } from '../components/GroupedSection';
import { IOSButton } from '../components/IOSButton';
import { LargeTitle } from '../components/LargeTitle';
import { StorageMeter } from '../components/StorageMeter';
import { TrackRow } from '../components/TrackRow';
import { useScreenContentInsets } from '../navigation/useScreenContentInsets';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';
import { confirmDestructive } from '../utils/confirm';

export function DeviceScreen() {
  const {
    device,
    libraryById,
    usbSupported,
    showDemoControls,
    connectDemoPlayer,
    linkUsbPlayer,
    disconnectPlayer,
    resetDemoData,
    syncProgress,
  } = useMusicStore();
  const { colors } = useTheme();
  const contentInsets = useScreenContentInsets();

  const onDeviceTracks = (device?.trackIds ?? [])
    .map((id) => libraryById.get(id))
    .filter(Boolean);

  const linkFooter = usbSupported
    ? 'Plug the MP3 player into your phone (USB-C / Lightning adapter), open Files → Locations, then choose the player’s Music folder so PulseDock can copy MP3s onto it.'
    : showDemoControls
      ? 'USB file copy runs in the iOS/Android app. This web preview uses the demo player only.'
      : 'Plug in your MP3 player and link its Music folder to manage files on device.';

  const onDisconnect = async () => {
    const ok = await confirmDestructive({
      title: 'Disconnect Player?',
      message: device?.isDemo
        ? 'The demo player will disconnect. Your library and selection stay on this device.'
        : 'PulseDock will stop writing to this USB folder until you link it again.',
      confirmLabel: 'Disconnect',
    });
    if (ok) disconnectPlayer();
  };

  const onResetDemo = async () => {
    const ok = await confirmDestructive({
      title: 'Reset Demo Data?',
      message: 'Sample tracks, selection, and the demo player will be restored to defaults.',
      confirmLabel: 'Reset',
    });
    if (ok) await resetDemoData();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.groupedBackground }]}>
      <FlatList
        data={onDeviceTracks}
        keyExtractor={(item) => item!.id}
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.groupedBackground }}
        contentContainerStyle={[styles.list, contentInsets]}
        ListHeaderComponent={
          <View>
            <View style={styles.titlePad}>
              <LargeTitle>Player</LargeTitle>
            </View>

            {device?.needsRelink ? (
              <GroupedSection
                header="Re-link Required"
                footer="iOS grants folder access per session. Link the USB Music folder again to continue copying files."
              >
                <View style={styles.deviceBlock}>
                  <Text style={[typography.headline, { color: colors.label }]}>
                    {device.name}
                  </Text>
                  <Text
                    style={[
                      typography.subhead,
                      { color: colors.secondaryLabel, marginTop: 6, marginBottom: 14 },
                    ]}
                  >
                    Access to the player folder expired.
                  </Text>
                  <IOSButton
                    label="Link USB Music Folder"
                    size="large"
                    onPress={() => void linkUsbPlayer()}
                  />
                </View>
              </GroupedSection>
            ) : null}

            {device?.connected ? (
              <>
                <GroupedSection
                  header="Connected Device"
                  footer={
                    device.isDemo
                      ? 'Demo mode simulates adds/removes. Link a real USB Music folder to copy files onto hardware.'
                      : 'PulseDock copies and deletes MP3s in this folder when you run Sync.'
                  }
                >
                  <View style={styles.deviceBlock}>
                    <View style={styles.deviceTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.headline, { color: colors.label }]}>
                          {device.name}
                        </Text>
                        <Text
                          style={[typography.subhead, { color: colors.secondaryLabel }]}
                        >
                          {device.model}
                        </Text>
                      </View>
                      <View
                        style={[styles.badge, { backgroundColor: colors.secondaryFill }]}
                        accessibilityLabel={device.isDemo ? 'Demo player' : 'USB player'}
                      >
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: device.isDemo ? colors.orange : colors.green },
                          ]}
                        />
                        <Text style={[typography.caption1, { color: colors.tint }]}>
                          {device.isDemo ? 'Demo' : 'USB'}
                        </Text>
                      </View>
                    </View>

                    <StorageMeter
                      usedBytes={device.usedBytes}
                      capacityBytes={device.capacityBytes}
                    />

                    <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
                      {device.trackIds.length} songs
                      {device.lastSyncedAt
                        ? ` · Synced ${new Date(device.lastSyncedAt).toLocaleString()}`
                        : ' · Not synced yet'}
                    </Text>
                    {!device.isDemo && device.rootUri ? (
                      <Text
                        style={[typography.caption2, { color: colors.tertiaryLabel }]}
                        numberOfLines={2}
                      >
                        {device.rootUri}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.rowActions, { borderTopColor: colors.separator }]}>
                    <IOSButton
                      label="Disconnect"
                      variant="plain"
                      size="small"
                      onPress={() => void onDisconnect()}
                      style={styles.half}
                    />
                    <View style={[styles.vSep, { backgroundColor: colors.separator }]} />
                    {device.isDemo && showDemoControls ? (
                      <IOSButton
                        label="Reset Demo"
                        variant="plain"
                        size="small"
                        onPress={() => void onResetDemo()}
                        style={styles.half}
                      />
                    ) : (
                      <IOSButton
                        label="Re-link"
                        variant="plain"
                        size="small"
                        onPress={() => void linkUsbPlayer()}
                        style={styles.half}
                      />
                    )}
                  </View>
                </GroupedSection>

                {usbSupported && device.isDemo ? (
                  <View style={styles.ctaPad}>
                    <IOSButton
                      label="Link USB Music Folder"
                      size="large"
                      onPress={() => void linkUsbPlayer()}
                    />
                  </View>
                ) : null}

                <Text
                  style={[
                    typography.footnote,
                    styles.sectionLabel,
                    { color: colors.secondaryLabel },
                  ]}
                  accessibilityRole="header"
                >
                  ON THIS PLAYER
                </Text>
              </>
            ) : !device?.needsRelink ? (
              <GroupedSection header="No Player" footer={linkFooter}>
                <View style={styles.deviceBlock}>
                  <Text style={[typography.headline, { color: colors.label }]}>
                    Nothing Connected
                  </Text>
                  <Text
                    style={[
                      typography.subhead,
                      { color: colors.secondaryLabel, marginTop: 6, marginBottom: 14 },
                    ]}
                  >
                    {usbSupported
                      ? 'Link the USB player’s Music folder to copy real MP3 files onto it.'
                      : showDemoControls
                        ? 'Use the demo player here, or open PulseDock on your phone to write to USB.'
                        : 'Link a USB Music folder to manage songs on your player.'}
                  </Text>
                  {usbSupported ? (
                    <IOSButton
                      label="Link USB Music Folder"
                      size="large"
                      onPress={() => void linkUsbPlayer()}
                    />
                  ) : null}
                  {showDemoControls ? (
                    <>
                      <View style={{ height: usbSupported ? 10 : 0 }} />
                      <IOSButton
                        label="Connect Demo Player"
                        variant={usbSupported ? 'gray' : 'filled'}
                        size={usbSupported ? 'medium' : 'large'}
                        onPress={connectDemoPlayer}
                      />
                    </>
                  ) : null}
                </View>
              </GroupedSection>
            ) : null}

            {syncProgress.error && Platform.OS !== 'web' ? (
              <Text
                style={[
                  typography.footnote,
                  { color: colors.danger, paddingHorizontal: 32, marginTop: 8 },
                ]}
              >
                {syncProgress.error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          device?.connected ? (
            <Text
              style={[
                typography.subhead,
                { color: colors.secondaryLabel, paddingHorizontal: 32, paddingTop: 8 },
              ]}
            >
              Nothing on the player yet. Choose songs in Library, then run Sync.
            </Text>
          ) : undefined
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              index === 0 && styles.firstRow,
              index === onDeviceTracks.length - 1 && styles.lastRow,
              {
                backgroundColor: colors.secondaryGrouped,
                marginHorizontal: 16,
              },
            ]}
          >
            <TrackRow
              track={item!}
              mode="plain"
              trailingLabel="On Player"
              showSeparator={index < onDeviceTracks.length - 1}
            />
          </View>
        )}
        ListFooterComponent={
          <View style={{ height: Platform.OS === 'web' ? 100 : 88 }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingTop: 8, paddingBottom: 32 },
  titlePad: { paddingHorizontal: 16, paddingTop: 4 },
  ctaPad: { paddingHorizontal: 16, marginBottom: 16 },
  deviceBlock: {
    padding: 16,
    gap: 14,
  },
  deviceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  rowActions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  half: { flex: 1 },
  vSep: { width: StyleSheet.hairlineWidth },
  sectionLabel: {
    marginLeft: 32,
    marginBottom: 8,
  },
  firstRow: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  lastRow: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
});
