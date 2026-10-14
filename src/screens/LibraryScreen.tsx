import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { GroupedSection } from '../components/GroupedSection';
import { IOSButton } from '../components/IOSButton';
import { TrackRow } from '../components/TrackRow';
import { importHint } from '../services/importTracks';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

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
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);

  const onImport = async () => {
    if (Platform.OS === 'ios') void Haptics.selectionAsync();
    setImporting(true);
    try {
      await importTracks();
    } finally {
      setImporting(false);
    }
  };

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

  return (
    <>
      {/* SDK 58 stable Stack.Toolbar — native header button */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Import MP3s"
          disabled={importing}
          onPress={() => void onImport()}
        >
          {importing ? '…' : 'Import'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <View style={[styles.root, { backgroundColor: colors.groupedBackground }]}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
                {importHint()}
              </Text>

              {Platform.OS === 'web' ? (
                <IOSButton
                  label={importing ? 'Importing…' : 'Import MP3s'}
                  onPress={() => void onImport()}
                  loading={importing}
                />
              ) : null}

              <View style={[styles.search, { backgroundColor: colors.fill }]}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={colors.tertiaryLabel}
                  clearButtonMode="while-editing"
                  style={[typography.body, styles.searchInput, { color: colors.label }]}
                />
              </View>

              <View style={styles.toolbar}>
                <IOSButton
                  label="Select All"
                  variant="tinted"
                  onPress={selectAll}
                  style={styles.toolBtn}
                />
                <IOSButton
                  label="Clear"
                  variant="gray"
                  onPress={clearSelection}
                  style={styles.toolBtn}
                />
              </View>

              <Text
                style={[typography.footnote, styles.count, { color: colors.secondaryLabel }]}
              >
                {selectedIds.length} selected · {tracks.length} in library
              </Text>
            </View>
          }
          ListEmptyComponent={
            <GroupedSection footer="Import MP3s from Files or iCloud to build your host library.">
              <View style={styles.empty}>
                <Text style={[typography.headline, { color: colors.label }]}>No Songs</Text>
                <Text
                  style={[typography.subhead, { color: colors.secondaryLabel, marginTop: 4 }]}
                >
                  Tap Import in the top-right to add MP3s.
                </Text>
              </View>
            </GroupedSection>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                index === 0 && styles.firstRow,
                index === filtered.length - 1 && styles.lastRow,
                {
                  backgroundColor: colors.secondaryGrouped,
                  marginHorizontal: 16,
                },
              ]}
            >
              <TrackRow
                track={item}
                selected={selectedIds.includes(item.id)}
                onToggle={() => toggleSelected(item.id)}
                onRemove={item.isDemo ? undefined : () => removeTrack(item.id)}
                trailingLabel={item.isDemo ? 'Sample' : undefined}
                showSeparator={index < filtered.length - 1}
              />
            </View>
          )}
          ListFooterComponent={<View style={{ height: 88 }} />}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: {
    paddingBottom: 32,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  search: {
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 36,
    justifyContent: 'center',
  },
  searchInput: {
    paddingVertical: 8,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
  },
  toolBtn: {
    flex: 1,
    minHeight: 44,
  },
  count: {
    marginLeft: 4,
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
    marginBottom: 8,
  },
  empty: {
    padding: 20,
  },
});
