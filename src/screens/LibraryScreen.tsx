import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { GroupedSection } from '../components/GroupedSection';
import { IOSButton } from '../components/IOSButton';
import { LargeTitle } from '../components/LargeTitle';
import {
  PullToRevealSearch,
  usePullToRevealSearch,
} from '../components/PullToRevealSearch';
import { TrackRow } from '../components/TrackRow';
import { usePhoneSafePadding } from '../navigation/usePhoneSafePadding';
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
  const safePad = usePhoneSafePadding();
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const pullSearch = usePullToRevealSearch(Platform.OS === 'web');

  const onImport = async () => {
    if (Platform.OS === 'ios') void Haptics.selectionAsync();
    setImporting(true);
    try {
      await importTracks();
    } finally {
      setImporting(false);
    }
  };

  const onNativeSearchChange = useCallback(
    (event: NativeSyntheticEvent<{ text: string }>) => {
      setQuery(event.nativeEvent.text);
    },
    [],
  );

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
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <Stack.SearchBar
          placeholder="Search"
          hideWhenScrolling
          placement="stacked"
          autoCapitalize="none"
          tintColor={colors.tint}
          textColor={colors.label}
          hintTextColor={colors.tertiaryLabel}
          barTintColor={colors.fill}
          onChangeText={onNativeSearchChange}
          onCancelButtonPress={() => setQuery('')}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            accessibilityLabel="Import MP3s"
            disabled={importing}
            onPress={() => void onImport()}
          >
            {importing ? '…' : 'Import'}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}

      <View style={[styles.root, { backgroundColor: colors.groupedBackground }]}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={Platform.OS === 'web' ? pullSearch.onScroll : undefined}
          style={{ backgroundColor: colors.groupedBackground }}
          contentContainerStyle={[styles.list, safePad]}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <LargeTitle>Library</LargeTitle>
              <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
                {importHint()}
              </Text>

              {Platform.OS === 'web' ? (
                <>
                  <PullToRevealSearch
                    value={query}
                    onChangeText={setQuery}
                    height={pullSearch.height}
                  />
                  <IOSButton
                    label={importing ? 'Importing…' : 'Import MP3s'}
                    onPress={() => void onImport()}
                    loading={importing}
                  />
                </>
              ) : null}

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
                {query.trim() ? ` · ${filtered.length} matches` : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <GroupedSection
              footer={
                query.trim()
                  ? 'Try a different name, artist, or album.'
                  : 'Import MP3s from Files or iCloud to build your host library.'
              }
            >
              <View style={styles.empty}>
                <Text style={[typography.headline, { color: colors.label }]}>
                  {query.trim() ? 'No Matches' : 'No Songs'}
                </Text>
                <Text
                  style={[typography.subhead, { color: colors.secondaryLabel, marginTop: 4 }]}
                >
                  {query.trim()
                    ? `Nothing matches “${query.trim()}”.`
                    : 'Tap Import in the top-right to add MP3s.'}
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
