export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  sizeBytes: number;
  /** Local URI after import, or empty for seeded demo metadata. */
  uri: string;
  fileName: string;
  addedAt: string;
  isDemo?: boolean;
};

export type PlayerDevice = {
  id: string;
  name: string;
  model: string;
  capacityBytes: number;
  usedBytes: number;
  connected: boolean;
  isDemo: boolean;
  /** Tracks currently on the player, keyed by host track id when known. */
  trackIds: string[];
  lastSyncedAt: string | null;
};

export type SyncPlanItem = {
  trackId: string;
  action: 'add' | 'remove' | 'keep';
};

export type SyncProgress = {
  active: boolean;
  currentLabel: string;
  completed: number;
  total: number;
  error: string | null;
};
