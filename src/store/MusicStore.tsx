import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEMO_PLAYER_CAPACITY, DEMO_TRACKS } from '../data/demoTracks';
import { pickMp3Files } from '../services/importTracks';
import {
  loadDevice,
  loadLibrary,
  loadSelection,
  saveDevice,
  saveLibrary,
  saveSelection,
} from '../services/storage';
import {
  applySyncPlan,
  buildSyncPlan,
  estimatePlanBytes,
  wouldExceedCapacity,
} from '../services/syncEngine';
import type { PlayerDevice, SyncProgress, Track } from '../types/music';

type MusicStoreValue = {
  ready: boolean;
  tracks: Track[];
  device: PlayerDevice | null;
  selectedIds: string[];
  syncProgress: SyncProgress;
  libraryById: Map<string, Track>;
  importTracks: () => Promise<void>;
  removeTrack: (id: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  connectDemoPlayer: () => void;
  disconnectPlayer: () => void;
  runSync: () => Promise<void>;
  resetDemoData: () => Promise<void>;
};

const MusicStoreContext = createContext<MusicStoreValue | null>(null);

function createDemoDevice(seedTrackIds: string[] = []): PlayerDevice {
  const usedBytes = DEMO_TRACKS.filter((t) => seedTrackIds.includes(t.id)).reduce(
    (sum, t) => sum + t.sizeBytes,
    0,
  );
  return {
    id: 'demo-nomad-clip',
    name: 'Nomad Clip',
    model: '32 GB USB-C player',
    capacityBytes: DEMO_PLAYER_CAPACITY,
    usedBytes,
    connected: true,
    isDemo: true,
    trackIds: seedTrackIds,
    lastSyncedAt: null,
  };
}

export function MusicStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [device, setDevice] = useState<PlayerDevice | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    active: false,
    currentLabel: '',
    completed: 0,
    total: 0,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedLibrary, storedDevice, storedSelection] = await Promise.all([
        loadLibrary(),
        loadDevice(),
        loadSelection(),
      ]);
      if (cancelled) return;

      const library = storedLibrary ?? DEMO_TRACKS;
      setTracks(library);

      const nextDevice = storedDevice ?? createDemoDevice(['demo-01', 'demo-03']);
      setDevice(nextDevice);

      const validSelection =
        storedSelection.length > 0
          ? storedSelection.filter((id) => library.some((t) => t.id === id))
          : library.map((t) => t.id);
      setSelectedIds(validSelection);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveLibrary(tracks);
  }, [tracks, ready]);

  useEffect(() => {
    if (!ready) return;
    void saveDevice(device);
  }, [device, ready]);

  useEffect(() => {
    if (!ready) return;
    void saveSelection(selectedIds);
  }, [selectedIds, ready]);

  const libraryById = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);

  const importTracks = useCallback(async () => {
    const imported = await pickMp3Files();
    if (imported.length === 0) return;
    setTracks((prev) => [...imported, ...prev]);
    setSelectedIds((prev) => [...imported.map((t) => t.id), ...prev]);
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setDevice((prev) =>
      prev
        ? {
            ...prev,
            trackIds: prev.trackIds.filter((x) => x !== id),
            usedBytes: Math.max(
              0,
              prev.usedBytes - (libraryById.get(id)?.sizeBytes ?? 0),
            ),
          }
        : prev,
    );
  }, [libraryById]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(tracks.map((t) => t.id));
  }, [tracks]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const connectDemoPlayer = useCallback(() => {
    setDevice(createDemoDevice([]));
  }, []);

  const disconnectPlayer = useCallback(() => {
    setDevice((prev) => (prev ? { ...prev, connected: false } : prev));
  }, []);

  const runSync = useCallback(async () => {
    if (!device?.connected) {
      setSyncProgress({
        active: false,
        currentLabel: '',
        completed: 0,
        total: 0,
        error: 'Connect a player before syncing.',
      });
      return;
    }

    const plan = buildSyncPlan(tracks, device, selectedIds);
    const actionable = plan.filter((p) => p.action !== 'keep');

    if (wouldExceedCapacity(device, plan, libraryById)) {
      setSyncProgress({
        active: false,
        currentLabel: '',
        completed: 0,
        total: 0,
        error: 'Not enough free space on the player for this sync set.',
      });
      return;
    }

    if (actionable.length === 0) {
      setSyncProgress({
        active: false,
        currentLabel: 'Already in sync',
        completed: 0,
        total: 0,
        error: null,
      });
      setDevice((prev) =>
        prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : prev,
      );
      return;
    }

    setSyncProgress({
      active: true,
      currentLabel: 'Preparing transfer…',
      completed: 0,
      total: actionable.length,
      error: null,
    });

    for (let i = 0; i < actionable.length; i += 1) {
      const item = actionable[i];
      const track = libraryById.get(item.trackId);
      const label =
        item.action === 'add'
          ? `Copying ${track?.title ?? 'track'}…`
          : `Removing ${track?.title ?? 'track'}…`;

      setSyncProgress({
        active: true,
        currentLabel: label,
        completed: i,
        total: actionable.length,
        error: null,
      });

      // Simulate USB write pacing so progress is visible.
      await new Promise((resolve) => setTimeout(resolve, 420));
    }

    const nextDevice = applySyncPlan(device, plan, libraryById);
    setDevice(nextDevice);
    setSyncProgress({
      active: false,
      currentLabel: 'Sync complete',
      completed: actionable.length,
      total: actionable.length,
      error: null,
    });
  }, [device, tracks, selectedIds, libraryById]);

  const resetDemoData = useCallback(async () => {
    setTracks(DEMO_TRACKS);
    setDevice(createDemoDevice(['demo-01', 'demo-03']));
    setSelectedIds(DEMO_TRACKS.map((t) => t.id));
    setSyncProgress({
      active: false,
      currentLabel: '',
      completed: 0,
      total: 0,
      error: null,
    });
  }, []);

  const value = useMemo<MusicStoreValue>(
    () => ({
      ready,
      tracks,
      device,
      selectedIds,
      syncProgress,
      libraryById,
      importTracks,
      removeTrack,
      toggleSelected,
      selectAll,
      clearSelection,
      connectDemoPlayer,
      disconnectPlayer,
      runSync,
      resetDemoData,
    }),
    [
      ready,
      tracks,
      device,
      selectedIds,
      syncProgress,
      libraryById,
      importTracks,
      removeTrack,
      toggleSelected,
      selectAll,
      clearSelection,
      connectDemoPlayer,
      disconnectPlayer,
      runSync,
      resetDemoData,
    ],
  );

  return (
    <MusicStoreContext.Provider value={value}>{children}</MusicStoreContext.Provider>
  );
}

export function useMusicStore(): MusicStoreValue {
  const ctx = useContext(MusicStoreContext);
  if (!ctx) {
    throw new Error('useMusicStore must be used within MusicStoreProvider');
  }
  return ctx;
}

export function useSyncSummary() {
  const { tracks, device, selectedIds, libraryById } = useMusicStore();
  const plan = useMemo(
    () => buildSyncPlan(tracks, device, selectedIds),
    [tracks, device, selectedIds],
  );
  const bytes = useMemo(
    () => estimatePlanBytes(plan, libraryById),
    [plan, libraryById],
  );
  return { plan, ...bytes };
}
