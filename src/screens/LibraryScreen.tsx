import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { BrandHeader } from '../components/BrandHeader';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { TrackRow } from '../components/TrackRow';
import { importHint } from '../services/importTracks';
import { useMusicStore } from '../store/MusicStore';
import { colors } from '../theme/colors';

export function LibraryScreen() {
  const {
    tracks,
    selectedIds,
    importTracks,
    removeTrack,
    toggleSelected,
    selectAll,
    clearSelection,
  } = useMusicStore();
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q),
    );
  }, [tracks, query]);

  const onImport = async () => {
    setImporting(true);
    try {
      await importTracks();
    } finally {
      setImporting(false);
    }
  };

  return (
    <Atmosphere>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pad}>
          <BrandHeader
            title="Your host library"
            subtitle={importHint()}
          />

          <View style={styles.actions}>
            <PrimaryButton
              label="Import MP3s"
              onPress={() => void onImport()}
              loading={importing}
              style={styles.flex}
            />
            <PrimaryButton
              label="Select all"
              variant="ghost"
              onPress={selectAll}
              style={styles.flex}
            />
            <PrimaryButton
              label="Clear"
              variant="ghost"
              onPress={clearSelection}
              style={styles.flex}
            />
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search title or artist"
            placeholderTextColor={colors.mist}
            style={styles.search}
          />

          <Text style={styles.count}>
            {selectedIds.length} selected for sync · {tracks.length} in library
          </Text>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="No tracks yet"
              body="Import MP3s to build the host library you will push to your player."
              actionLabel="Import MP3s"
              onAction={() => void onImport()}
            />
          }
          renderItem={({ item }) => (
            <TrackRow
              track={item}
              selected={selectedIds.includes(item.id)}
              onToggle={() => toggleSelected(item.id)}
              onRemove={item.isDemo ? undefined : () => removeTrack(item.id)}
              trailingLabel={item.isDemo ? 'Sample' : undefined}
            />
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
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  flex: { flex: 1 },
  search: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(14, 26, 38, 0.75)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.chalk,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    marginBottom: 10,
  },
  count: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.mist,
    marginBottom: 6,
  },
  list: {
    paddingBottom: 120,
  },
});
