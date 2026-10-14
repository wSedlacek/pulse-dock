import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GroupedSection } from '../components/GroupedSection';
import { IOSButton } from '../components/IOSButton';
import { LargeTitle } from '../components/LargeTitle';
import { StorageMeter } from '../components/StorageMeter';
import { useMusicStore, useSyncSummary } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';
import { formatBytes } from '../utils/format';

export function SyncScreen() {
  const { device, libraryById, syncProgress, runSync, connectDemoPlayer } =
    useMusicStore();
  const { plan, addBytes, removeBytes, keepBytes } = useSyncSummary();
  const { colors } = useTheme();

  const counts = useMemo(
    () => ({
      add: plan.filter((p) => p.action === 'add').length,
      remove: plan.filter((p) => p.action === 'remove').length,
      keep: plan.filter((p) => p.action === 'keep').length,
    }),
    [plan],
  );

  const projectedUsed = keepBytes + addBytes;
  const progressRatio =
    syncProgress.total > 0 ? syncProgress.completed / syncProgress.total : 0;
  const queue = plan.filter((p) => p.action !== 'keep').slice(0, 12);

  const onSync = async () => {
    if (Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await runSync();
    if (Platform.OS === 'ios') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.groupedBackground }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.pad}
      >
        <View style={styles.titlePad}>
          <LargeTitle>Sync</LargeTitle>
        </View>
        {!device?.connected ? (
          <GroupedSection
            header="Player Offline"
            footer="Connect your USB MP3 player or use the demo Nomad Clip to preview a transfer."
          >
            <View style={styles.block}>
              <IOSButton label="Connect Demo Player" onPress={connectDemoPlayer} />
            </View>
          </GroupedSection>
        ) : (
          <>
            <GroupedSection
              header={`Sync Plan → ${device.name}`}
              footer={`Transfer ${formatBytes(addBytes)} · free ${formatBytes(removeBytes)} · keep ${formatBytes(keepBytes)}`}
            >
              <View style={styles.stats}>
                <Stat label="Add" value={counts.add} color={colors.tint} />
                <View style={[styles.statSep, { backgroundColor: colors.separator }]} />
                <Stat label="Remove" value={counts.remove} color={colors.danger} />
                <View style={[styles.statSep, { backgroundColor: colors.separator }]} />
                <Stat label="Keep" value={counts.keep} color={colors.orange} />
              </View>
              <View style={[styles.meterWrap, { borderTopColor: colors.separator }]}>
                <StorageMeter
                  usedBytes={projectedUsed}
                  capacityBytes={device.capacityBytes}
                  label="After Sync"
                />
              </View>
            </GroupedSection>

            <GroupedSection
              header="Transfer Queue"
              footer={
                queue.length === 0
                  ? 'Selection already matches the player.'
                  : 'Songs marked Add are copied; Remove deletes them from the player.'
              }
            >
              {queue.length === 0 ? (
                <View style={styles.block}>
                  <Text style={[typography.body, { color: colors.secondaryLabel }]}>
                    Already in sync
                  </Text>
                </View>
              ) : (
                queue.map((item, index) => {
                  const track = libraryById.get(item.trackId);
                  return (
                    <View
                      key={`${item.action}-${item.trackId}`}
                      style={[
                        styles.queueRow,
                        index < queue.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.separator,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.caption1,
                          styles.queueAction,
                          {
                            color:
                              item.action === 'add' ? colors.tint : colors.danger,
                          },
                        ]}
                      >
                        {item.action === 'add' ? 'ADD' : 'RM'}
                      </Text>
                      <Text
                        style={[typography.body, { color: colors.label, flex: 1 }]}
                        numberOfLines={1}
                      >
                        {track?.title ?? 'Unknown'}
                      </Text>
                    </View>
                  );
                })
              )}
            </GroupedSection>

            {(syncProgress.active ||
              syncProgress.currentLabel ||
              syncProgress.error) && (
              <GroupedSection header="Status">
                <View style={styles.block}>
                  {syncProgress.error ? (
                    <Text style={[typography.body, { color: colors.danger }]}>
                      {syncProgress.error}
                    </Text>
                  ) : (
                    <>
                      <Text style={[typography.body, { color: colors.label }]}>
                        {syncProgress.currentLabel || 'Ready'}
                      </Text>
                      {syncProgress.total > 0 ? (
                        <View
                          style={[styles.progressTrack, { backgroundColor: colors.fill }]}
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: colors.tint,
                                width: `${Math.max(4, progressRatio * 100)}%`,
                              },
                            ]}
                          />
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              </GroupedSection>
            )}

            <View style={styles.cta}>
              <IOSButton
                label={syncProgress.active ? 'Syncing…' : 'Sync to Player'}
                onPress={() => void onSync()}
                loading={syncProgress.active}
                disabled={!device.connected}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[typography.title1, { color }]}>{value}</Text>
      <Text style={[typography.caption1, { color: colors.secondaryLabel }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: {
    paddingTop: 8,
    paddingBottom: 96,
  },
  titlePad: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  block: {
    padding: 16,
    gap: 12,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statSep: {
    width: StyleSheet.hairlineWidth,
  },
  meterWrap: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  queueAction: {
    width: 36,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
  },
  cta: {
    paddingHorizontal: 16,
  },
});
