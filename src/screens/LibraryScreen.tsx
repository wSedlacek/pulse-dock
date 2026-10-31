import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlatList } from 'react-native-gesture-handler';
import { GroupedSection } from '../components/GroupedSection';
import { IOSButton } from '../components/IOSButton';
import { LargeTitle } from '../components/LargeTitle';
import {
  PullToRevealSearch,
  usePullToRevealSearch,
} from '../components/PullToRevealSearch';
import { TrackRow } from '../components/TrackRow';
import { useScreenContentInsets } from '../navigation/useScreenContentInsets';
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
    setSelection,
  } = useMusicStore();
  const { colors } = useTheme();
  const contentInsets = useScreenContentInsets();
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
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

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((t) => selectedIds.includes(t.id));

  const onSelectAllPress = () => {
    if (Platform.OS === 'ios') void Haptics.selectionAsync();
    const visibleIds = filtered.map((t) => t.id);
    if (allFilteredSelected) {
      const visible = new Set(visibleIds);
      setSelection(selectedIds.filter((id) => !visible.has(id)));
    } else {
      setSelection([...new Set([...selectedIds, ...visibleIds])]);
    }
  };

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

      <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={Platform.OS === 'web' ? pullSearch.onScroll : undefined}
          onScrollBeginDrag={() => setOpenSwipeId(null)}
          style={[styles.root, { backgroundColor: colors.groupedBackground }]}
          contentContainerStyle={[styles.list, contentInsets]}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <LargeTitle>Library</LargeTitle>
              {Platform.OS === 'web' ? (
                <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
                  {importHint()}
                </Text>
              ) : null}

              {Platform.OS === 'web' ? (
                <>
                  <PullToRevealSearch
                    value={query}
                    onChangeText={setQuery}
                    height={pullSearch.height}
                  />
                  <IOSButton
                    label={importing ? 'Importing…' : 'Import MP3s'}
                    size="large"
                    onPress={() => void onImport()}
                    loading={importing}
                  />
                </>
              ) : null}

              {/* Native-style edit chrome: plain tint text, not chunky buttons */}
              <View style={styles.selectBar}>
                <Pressable
                  accessibilityRole="button"
                  onPress={onSelectAllPress}
                  hitSlop={8}
                  style={({ pressed }) => [{ opacity: pressed ? 0.35 : 1 }]}
                >
                  <Text style={[typography.body, { color: colors.tint }]}>
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </Text>
                </Pressable>
                <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
                  {selectedIds.length} of {tracks.length} for sync
                  {query.trim() ? ` · ${filtered.length} shown` : ''}
                </Text>
              </View>
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
                swipeOpenId={openSwipeId}
                onSwipeOpenChange={setOpenSwipeId}
              />
            </View>
          )}
          ListFooterComponent={
            <View style={{ height: Platform.OS === 'web' ? 100 : 24 }} />
          }
        />
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
  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingRight: 4,
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
    marginBottom: 8,
  },
  empty: {
    padding: 20,
  },
});
