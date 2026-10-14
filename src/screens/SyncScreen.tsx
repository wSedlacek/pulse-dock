import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Atmosphere } from '../components/Atmosphere';
import { BrandHeader } from '../components/BrandHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { StorageMeter } from '../components/StorageMeter';
import { useMusicStore, useSyncSummary } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatBytes } from '../utils/format';

export function SyncScreen() {
  const { device, libraryById, syncProgress, runSync, connectDemoPlayer } =
    useMusicStore();
  const { plan, addBytes, removeBytes, keepBytes } = useSyncSummary();
  const { colors } = useTheme();

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

  const panelStyle = [
    styles.panel,
    {
      borderColor: colors.line,
      backgroundColor: colors.inkElevated,
    },
  ];

  return (
    <Atmosphere>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.pad}>
          <BrandHeader
            title="Push the sync set"
            subtitle="The iPhone stays the source of truth. PulseDock copies selected songs to the player and removes anything left out of the set."
          />

          {!device?.connected ? (
            <View style={panelStyle}>
              <Text style={[styles.panelTitle, { color: colors.chalk }]}>
                Player offline
              </Text>
              <Text style={[styles.panelBody, { color: colors.mist }]}>
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
              <Animated.View entering={FadeInDown.duration(450)} style={panelStyle}>
                <Text style={[styles.panelTitle, { color: colors.chalk }]}>
                  Sync plan → {device.name}
                </Text>
                <View style={styles.statRow}>
                  <Stat label="Add" value={String(counts.add)} accent={colors.accent} />
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
                <Text style={[styles.panelBody, { color: colors.mist }]}>
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
                style={panelStyle}
              >
                <Text style={[styles.panelTitle, { color: colors.chalk }]}>
                  Transfer queue
                </Text>
                {plan.filter((p) => p.action !== 'keep').length === 0 ? (
                  <Text style={[styles.panelBody, { color: colors.mist }]}>
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
                        <View
                          key={`${item.action}-${item.trackId}`}
                          style={[styles.queueRow, { borderBottomColor: colors.line }]}
                        >
                          <Text
                            style={[
                              styles.queueAction,
                              {
                                color:
                                  item.action === 'add' ? colors.accent : colors.danger,
                              },
                            ]}
                          >
                            {item.action === 'add' ? 'ADD' : 'RM'}
                          </Text>
                          <Text
                            style={[styles.queueTitle, { color: colors.chalk }]}
                            numberOfLines={1}
                          >
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
                <View style={panelStyle}>
                  <Text style={[styles.panelTitle, { color: colors.chalk }]}>Status</Text>
                  {syncProgress.error ? (
                    <Text style={[styles.error, { color: colors.danger }]}>
                      {syncProgress.error}
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.panelBody, { color: colors.mist }]}>
                        {syncProgress.currentLabel || 'Ready'}
                      </Text>
                      {syncProgress.total > 0 ? (
                        <View
                          style={[styles.progressTrack, { backgroundColor: colors.line }]}
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: colors.accent,
                                width: `${Math.max(4, progressRatio * 100)}%`,
                              },
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

              <Text style={[styles.footnote, { color: colors.mist }]}>
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
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.stat,
        {
          borderColor: colors.line,
          backgroundColor: colors.inkSoft,
        },
      ]}
    >
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mist }]}>{label}</Text>
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
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  panelTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },
  panelBody: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Syne_700Bold',
    fontSize: 24,
  },
  statLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
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
  },
  queueAction: {
    fontFamily: 'IBMPlexSans_700Bold',
    fontSize: 11,
    width: 34,
  },
  queueTitle: {
    flex: 1,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  error: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 13,
  },
  cta: {
    marginTop: 4,
  },
  footnote: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  mt: { marginTop: 4 },
});
