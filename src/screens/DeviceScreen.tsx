import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { BrandHeader } from '../components/BrandHeader';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { StorageMeter } from '../components/StorageMeter';
import { TrackRow } from '../components/TrackRow';
import { useMusicStore } from '../store/MusicStore';
import { colors } from '../theme/colors';

export function DeviceScreen() {
  const { device, libraryById, connectDemoPlayer, disconnectPlayer, resetDemoData } =
    useMusicStore();

  const onDeviceTracks = (device?.trackIds ?? [])
    .map((id) => libraryById.get(id))
    .filter(Boolean);

  return (
    <Atmosphere>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <BrandHeader
            title="Connected player"
            subtitle="Use the iPhone as the host. Plug a USB-C MP3 player in with an adapter, or practice with the demo Nomad Clip."
          />

          {device?.connected ? (
            <View style={styles.panel}>
              <View style={styles.panelTop}>
                <View>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceModel}>{device.model}</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>
                    {device.isDemo ? 'Demo link' : 'Linked'}
                  </Text>
                </View>
              </View>

              <StorageMeter
                usedBytes={device.usedBytes}
                capacityBytes={device.capacityBytes}
              />

              <Text style={styles.meta}>
                {device.trackIds.length} songs on player
                {device.lastSyncedAt
                  ? ` · last sync ${new Date(device.lastSyncedAt).toLocaleString()}`
                  : ' · not synced yet'}
              </Text>

              <View style={styles.actions}>
                <PrimaryButton
                  label="Disconnect"
                  variant="ghost"
                  onPress={disconnectPlayer}
                  style={styles.flex}
                />
                <PrimaryButton
                  label="Reset demo"
                  variant="ghost"
                  onPress={() => void resetDemoData()}
                  style={styles.flex}
                />
              </View>
            </View>
          ) : (
            <View style={styles.panel}>
              <EmptyState
                title="No player connected"
                body="Connect a mass-storage MP3 player over USB-C, then manage its music from this host. Until hardware is plugged in, use the demo player to rehearse sync sets."
                actionLabel="Connect demo player"
                onAction={connectDemoPlayer}
              />
            </View>
          )}

          <Text style={styles.section}>On this player</Text>
        </View>

        <FlatList
          data={onDeviceTracks}
          keyExtractor={(item) => item!.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.pad}>
              <Text style={styles.emptyCopy}>
                Nothing on the player yet. Pick songs in Library, then run Sync.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TrackRow track={item!} mode="plain" trailingLabel="On player" />
          )}
        />
      </SafeAreaView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(14, 26, 38, 0.72)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    gap: 14,
  },
  panelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  deviceName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    color: colors.chalk,
  },
  deviceModel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.mist,
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 255, 200, 0.12)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.led,
  },
  liveText: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 11,
    color: colors.led,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.chalkDim,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: { flex: 1 },
  section: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 13,
    color: colors.chalk,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  list: {
    paddingBottom: 120,
  },
  emptyCopy: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    color: colors.mist,
    lineHeight: 20,
  },
});
