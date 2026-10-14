import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Atmosphere } from '../components/Atmosphere';
import { BrandHeader } from '../components/BrandHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { StorageMeter } from '../components/StorageMeter';
import { useMusicStore, useSyncSummary } from '../store/MusicStore';
import { colors } from '../theme/colors';
import { formatBytes } from '../utils/format';

export function SyncScreen() {
  const { device, libraryById, syncProgress, runSync, connectDemoPlayer } =
    useMusicStore();
  const { plan, addBytes, removeBytes, keepBytes } = useSyncSummary();

  const counts = useMemo(() => {
    return {
      add: plan.filter((p) => p.action === 'add').length,
      remove: plan.filter((p) => p.action === 'remove').length,
      keep: plan.filter((p) => p.action === 'keep').length,
    };
  }, [plan]);

  const projectedUsed = keepBytes + addBytes;
  const progressRatio =
    syncProgress.total > 0 ? syncProgress.completed / syncProgress.total : 0;

  return (
    <Atmosphere>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.pad}>
          <BrandHeader
            title="Push the sync set"
            subtitle="The iPhone stays the source of truth. PulseDock copies selected songs to the player and removes anything left out of the set."
          />

          {!device?.connected ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Player offline</Text>
              <Text style={styles.panelBody}>
                Connect your USB MP3 player or use the demo Nomad Clip to preview a
                transfer.
              </Text>
              <PrimaryButton
                label="Connect demo player"
                onPress={connectDemoPlayer}
                style={styles.mt}
              />
            </View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.duration(450)} style={styles.panel}>
                <Text style={styles.panelTitle}>Sync plan → {device.name}</Text>
                <View style={styles.statRow}>
                  <Stat label="Add" value={String(counts.add)} accent={colors.led} />
                  <Stat
                    label="Remove"
                    value={String(counts.remove)}
                    accent={colors.danger}
                  />
                  <Stat
                    label="Keep"
                    value={String(counts.keep)}
                    accent={colors.amber}
                  />
                </View>
                <Text style={styles.panelBody}>
                  Transfer {formatBytes(addBytes)} · free {formatBytes(removeBytes)} ·
                  keep {formatBytes(keepBytes)}
                </Text>
                <StorageMeter
                  usedBytes={projectedUsed}
                  capacityBytes={device.capacityBytes}
                  label="Projected after sync"
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(80).duration(450)}
                style={styles.panel}
              >
                <Text style={styles.panelTitle}>Transfer queue</Text>
                {plan.filter((p) => p.action !== 'keep').length === 0 ? (
                  <Text style={styles.panelBody}>
                    Host selection already matches the player. Run sync to refresh the
                    timestamp, or change the library selection.
                  </Text>
                ) : (
                  plan
                    .filter((p) => p.action !== 'keep')
                    .slice(0, 12)
                    .map((item) => {
                      const track = libraryById.get(item.trackId);
                      return (
                        <View key={`${item.action}-${item.trackId}`} style={styles.queueRow}>
                          <Text
                            style={[
                              styles.queueAction,
                              item.action === 'add' ? styles.add : styles.remove,
                            ]}
                          >
                            {item.action === 'add' ? 'ADD' : 'RM'}
                          </Text>
                          <Text style={styles.queueTitle} numberOfLines={1}>
                            {track?.title ?? 'Unknown track'}
                          </Text>
                        </View>
                      );
                    })
                )}
              </Animated.View>

              {(syncProgress.active ||
                syncProgress.currentLabel ||
                syncProgress.error) && (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Status</Text>
                  {syncProgress.error ? (
                    <Text style={styles.error}>{syncProgress.error}</Text>
                  ) : (
                    <>
                      <Text style={styles.panelBody}>
                        {syncProgress.currentLabel || 'Ready'}
                      </Text>
                      {syncProgress.total > 0 ? (
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${Math.max(4, progressRatio * 100)}%` },
                            ]}
                          />
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              )}

              <PrimaryButton
                label={syncProgress.active ? 'Syncing…' : 'Sync to player'}
                onPress={() => void runSync()}
                loading={syncProgress.active}
                disabled={!device.connected}
                style={styles.cta}
              />

              <Text style={styles.footnote}>
                Hardware tip: cheap USB mass-storage players appear in the Files app
                when connected with a USB-C adapter. PulseDock manages the sync set on
                the phone; the demo player rehearses the same add/remove workflow.
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Atmosphere>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
    gap: 14,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(14, 26, 38, 0.72)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  panelTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: colors.chalk,
  },
  panelBody: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.mist,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(7, 16, 24, 0.45)',
  },
  statValue: {
    fontFamily: 'Syne_700Bold',
    fontSize: 24,
  },
  statLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.mist,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  queueAction: {
    fontFamily: 'IBMPlexSans_700Bold',
    fontSize: 11,
    width: 34,
  },
  add: { color: colors.led },
  remove: { color: colors.danger },
  queueTitle: {
    flex: 1,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    color: colors.chalk,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 241, 247, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.led,
  },
  error: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 13,
    color: colors.danger,
  },
  cta: {
    marginTop: 4,
  },
  footnote: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.mist,
  },
  mt: { marginTop: 4 },
});
