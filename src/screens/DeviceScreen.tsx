import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GroupedSection } from '../components/GroupedSection';
import { IOSButton } from '../components/IOSButton';
import { StorageMeter } from '../components/StorageMeter';
import { TrackRow } from '../components/TrackRow';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

export function DeviceScreen() {
  const navigation = useNavigation();
  const { device, libraryById, connectDemoPlayer, disconnectPlayer, resetDemoData } =
    useMusicStore();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Player' });
  }, [navigation]);

  const onDeviceTracks = (device?.trackIds ?? [])
    .map((id) => libraryById.get(id))
    .filter(Boolean);

  return (
    <View style={[styles.root, { backgroundColor: colors.groupedBackground }]}>
      <FlatList
        data={onDeviceTracks}
        keyExtractor={(item) => item!.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {device?.connected ? (
              <>
                <GroupedSection
                  header="Connected Device"
                  footer="Plug a USB-C MP3 player into your iPhone with an adapter, or use the demo Nomad Clip to practice sync sets."
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
                      <View style={[styles.pill, { backgroundColor: colors.secondaryFill }]}>
                        <View style={[styles.dot, { backgroundColor: colors.green }]} />
                        <Text style={[typography.caption1, { color: colors.tint }]}>
                          {device.isDemo ? 'Demo' : 'Linked'}
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
                  </View>

                  <View style={[styles.rowActions, { borderTopColor: colors.separator }]}>
                    <IOSButton
                      label="Disconnect"
                      variant="plain"
                      onPress={disconnectPlayer}
                      style={styles.half}
                    />
                    <View style={[styles.vSep, { backgroundColor: colors.separator }]} />
                    <IOSButton
                      label="Reset Demo"
                      variant="plain"
                      onPress={() => void resetDemoData()}
                      style={styles.half}
                    />
                  </View>
                </GroupedSection>

                <Text
                  style={[
                    typography.footnote,
                    styles.sectionLabel,
                    { color: colors.secondaryLabel },
                  ]}
                >
                  ON THIS PLAYER
                </Text>
              </>
            ) : (
              <GroupedSection
                header="No Player"
                footer="Connect a mass-storage MP3 player over USB-C, then manage its music from this host."
              >
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
                    Use the demo player to rehearse syncing before you plug in hardware.
                  </Text>
                  <IOSButton label="Connect Demo Player" onPress={connectDemoPlayer} />
                </View>
              </GroupedSection>
            )}
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
          ) : null
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
        ListFooterComponent={<View style={{ height: 48 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingTop: 8, paddingBottom: 32 },
  deviceBlock: {
    padding: 16,
    gap: 14,
  },
  deviceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  lastRow: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
});
