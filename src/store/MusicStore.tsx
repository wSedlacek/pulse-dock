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
import { SHOW_DEMO_CONTROLS } from '../demo/showDemoControls';
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
import {
  canUseUsbFileCopy,
  executeUsbSync,
  pickUsbPlayerFolder,
  tryRestoreUsbPlayer,
} from '../services/usbPlayer';
import type { PlayerDevice, SyncProgress, Track } from '../types/music';

type MusicStoreValue = {
  ready: boolean;
  tracks: Track[];
  device: PlayerDevice | null;
  selectedIds: string[];
  syncProgress: SyncProgress;
  libraryById: Map<string, Track>;
  usbSupported: boolean;
  showDemoControls: boolean;
  importTracks: () => Promise<void>;
  removeTrack: (id: string) => void;
  toggleSelected: (id: string) => void;
  setSelection: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  connectDemoPlayer: () => void;
  linkUsbPlayer: () => Promise<void>;
  disconnectPlayer: () => void;
  runSync: () => Promise<boolean>;
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
    rootUri: null,
    fileNames: Object.fromEntries(
      seedTrackIds.map((id) => {
        const track = DEMO_TRACKS.find((t) => t.id === id);
        return [id, track?.fileName ?? `${id}.mp3`];
      }),
    ),
    trackIds: seedTrackIds,
    lastSyncedAt: null,
  };
}

function normalizeDevice(raw: PlayerDevice | null): PlayerDevice | null {
  if (!raw) return null;
  return {
    ...raw,
    rootUri: raw.rootUri ?? null,
    fileNames: raw.fileNames ?? {},
    needsRelink: raw.needsRelink ?? false,
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

      // Native production: empty library. Web / __DEV__: sample tracks for rehearsal.
      const library =
        storedLibrary ?? (SHOW_DEMO_CONTROLS ? DEMO_TRACKS : []);
      setTracks(library);

      const normalized = normalizeDevice(storedDevice);
      let nextDevice: PlayerDevice | null;
      if (!normalized) {
        nextDevice = SHOW_DEMO_CONTROLS
          ? createDemoDevice(['demo-01', 'demo-03'])
          : null;
      } else if (normalized.isDemo) {
        nextDevice = SHOW_DEMO_CONTROLS ? normalized : null;
      } else {
        nextDevice = tryRestoreUsbPlayer(normalized, library);
      }
      setDevice(nextDevice);

      // null = never saved → select all real (non-demo) tracks on first run.
      // [] = user cleared; keep empty across relaunches.
      if (storedSelection === null) {
        setSelectedIds(
          library.filter((t) => !t.isDemo || SHOW_DEMO_CONTROLS).map((t) => t.id),
        );
      } else {
        setSelectedIds(
          storedSelection.filter((id) => library.some((t) => t.id === id)),
        );
      }
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
    // Keep USB device.trackIds so Sync can delete the on-disk file.
    // Demo player: drop immediately (no real files).
    setDevice((prev) => {
      if (!prev?.isDemo) return prev;
      return {
        ...prev,
        trackIds: prev.trackIds.filter((x) => x !== id),
        fileNames: Object.fromEntries(
          Object.entries(prev.fileNames).filter(([key]) => key !== id),
        ),
        usedBytes: Math.max(
          0,
          prev.usedBytes - (libraryById.get(id)?.sizeBytes ?? 0),
        ),
      };
    });
  }, [libraryById]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(tracks.map((t) => t.id));
  }, [tracks]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const connectDemoPlayer = useCallback(() => {
    if (!SHOW_DEMO_CONTROLS) return;
    setDevice(createDemoDevice([]));
    setSyncProgress({
      active: false,
      currentLabel: '',
      completed: 0,
      total: 0,
      error: null,
    });
  }, []);

  const linkUsbPlayer = useCallback(async () => {
    try {
      const result = await pickUsbPlayerFolder(tracks);
      if (!result) return;
      setDevice(result.device);
      setSyncProgress({
        active: false,
        currentLabel:
          result.orphanFiles.length > 0
            ? `Linked · ${result.orphanFiles.length} unknown MP3s left untouched`
            : 'USB player linked',
        completed: 0,
        total: 0,
        error: null,
      });
    } catch (error) {
      setSyncProgress({
        active: false,
        currentLabel: '',
        completed: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Could not link USB player.',
      });
    }
  }, [tracks]);

  const disconnectPlayer = useCallback(() => {
    setDevice((prev) => (prev ? { ...prev, connected: false } : prev));
  }, []);

  const runSync = useCallback(async (): Promise<boolean> => {
    if (!device?.connected) {
      setSyncProgress({
        active: false,
        currentLabel: '',
        completed: 0,
        total: 0,
        error: device?.needsRelink
          ? 'Re-link the USB Music folder on the Player tab, then sync again.'
          : 'Connect a player before syncing.',
      });
      return false;
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
      return false;
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
      return true;
    }

    if (!device.isDemo) {
      const missingFile = actionable.find((item) => {
        if (item.action !== 'add') return false;
        const track = libraryById.get(item.trackId);
        return !track?.uri;
      });
      if (missingFile) {
        const track = libraryById.get(missingFile.trackId);
        setSyncProgress({
          active: false,
          currentLabel: '',
          completed: 0,
          total: 0,
          error: `"${track?.title ?? 'A song'}" has no local file. Import the MP3, then sync.`,
        });
        return false;
      }
    }

    setSyncProgress({
      active: true,
      currentLabel: device.isDemo ? 'Preparing demo transfer…' : 'Preparing USB transfer…',
      completed: 0,
      total: actionable.length,
      error: null,
    });

    try {
      if (device.isDemo) {
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
          await new Promise((resolve) => setTimeout(resolve, 320));
        }
        setDevice(applySyncPlan(device, plan, libraryById));
      } else {
        const nextDevice = await executeUsbSync({
          device,
          plan,
          libraryById,
          onProgress: (label, completed, total) => {
            setSyncProgress({
              active: true,
              currentLabel: label,
              completed,
              total,
              error: null,
            });
          },
        });
        setDevice(nextDevice);
      }

      setSyncProgress({
        active: false,
        currentLabel: device.isDemo
          ? 'Demo sync complete'
          : 'Sync complete — files written to the player',
        completed: actionable.length,
        total: actionable.length,
        error: null,
      });
      return true;
    } catch (error) {
      setSyncProgress({
        active: false,
        currentLabel: '',
        completed: 0,
        total: actionable.length,
        error:
          error instanceof Error
            ? error.message
            : 'USB transfer failed. Check the cable and re-link the player folder.',
      });
      return false;
    }
  }, [device, tracks, selectedIds, libraryById]);

  const resetDemoData = useCallback(async () => {
    if (!SHOW_DEMO_CONTROLS) return;
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
      usbSupported: canUseUsbFileCopy(),
      showDemoControls: SHOW_DEMO_CONTROLS,
      importTracks,
      removeTrack,
      toggleSelected,
      setSelection,
      selectAll,
      clearSelection,
      connectDemoPlayer,
      linkUsbPlayer,
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
      setSelection,
      selectAll,
      clearSelection,
      connectDemoPlayer,
      linkUsbPlayer,
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
