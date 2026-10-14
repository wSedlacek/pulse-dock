import { Directory, File } from 'expo-file-system';
import { Platform } from 'react-native';
import type { PlayerDevice, SyncPlanItem, Track } from '../types/music';

const MANIFEST_NAME = '.pulsedock-library.json';
/** Fallback when the volume does not report capacity. */
const DEFAULT_CAPACITY_BYTES = 32 * 1024 * 1024 * 1024;

export type PlayerManifest = {
  version: 1;
  tracks: Record<
    string,
    {
      fileName: string;
      title: string;
      sizeBytes: number;
    }
  >;
};

export type UsbLinkResult = {
  device: PlayerDevice;
  orphanFiles: string[];
};

function isMp3Name(name: string): boolean {
  return /\.mp3$/i.test(name);
}

/** FAT-safe file names for cheap USB MP3 players. */
export function sanitizePlayerFileName(fileName: string): string {
  const trimmed = fileName.trim() || 'track.mp3';
  const base = trimmed.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
  return /\.mp3$/i.test(base) ? base : `${base}.mp3`;
}

function uniqueFileName(desired: string, used: Set<string>): string {
  let candidate = sanitizePlayerFileName(desired);
  if (!used.has(candidate.toLowerCase())) {
    used.add(candidate.toLowerCase());
    return candidate;
  }
  const stem = candidate.replace(/\.mp3$/i, '');
  let i = 2;
  while (used.has(`${stem} (${i}).mp3`.toLowerCase())) i += 1;
  candidate = `${stem} (${i}).mp3`;
  used.add(candidate.toLowerCase());
  return candidate;
}

export function canUseUsbFileCopy(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function openDirectory(uri: string): Directory {
  return new Directory(uri);
}

function resolveMusicDirectory(root: Directory): Directory {
  if (!root.exists) {
    throw new Error('Could not open the selected player folder.');
  }

  const entries = root.list();
  const existing = entries.find(
    (entry) =>
      entry instanceof Directory && /^(music|mp3|songs|audio)$/i.test(entry.name),
  );
  if (existing instanceof Directory) {
    return existing;
  }

  // Write into the folder the user picked (often already Music/).
  return root;
}

function readManifest(musicDir: Directory): PlayerManifest {
  const manifestFile = new File(musicDir, MANIFEST_NAME);
  if (!manifestFile.exists) {
    return { version: 1, tracks: {} };
  }
  try {
    const parsed = JSON.parse(manifestFile.textSync()) as PlayerManifest;
    if (!parsed || parsed.version !== 1 || typeof parsed.tracks !== 'object') {
      return { version: 1, tracks: {} };
    }
    return parsed;
  } catch {
    return { version: 1, tracks: {} };
  }
}

function writeManifest(musicDir: Directory, manifest: PlayerManifest): void {
  const manifestFile = new File(musicDir, MANIFEST_NAME);
  const payload = JSON.stringify(manifest, null, 2);
  if (manifestFile.exists) {
    manifestFile.writeSync(payload);
    return;
  }
  manifestFile.create();
  manifestFile.writeSync(payload);
}

function listMp3Files(musicDir: Directory): File[] {
  return musicDir
    .list()
    .filter((entry): entry is File => entry instanceof File && isMp3Name(entry.name));
}

function estimateCapacity(musicDir: Directory, usedBytes: number): number {
  try {
    const info = musicDir.info();
    if (typeof info.size === 'number' && info.size > usedBytes) {
      // Directory size is used space only — keep a generous working capacity.
      return Math.max(info.size * 4, usedBytes + 512 * 1024 * 1024, DEFAULT_CAPACITY_BYTES);
    }
  } catch {
    // ignore
  }
  return Math.max(DEFAULT_CAPACITY_BYTES, usedBytes + 512 * 1024 * 1024);
}

/**
 * Opens the system folder picker so the user can grant access to a USB
 * mass-storage MP3 player (shown under Locations in Files / SAF on Android).
 */
export async function pickUsbPlayerFolder(
  library: Track[],
): Promise<UsbLinkResult | null> {
  if (!canUseUsbFileCopy()) {
    throw new Error(
      'USB file copy needs the iOS or Android app. Use a development build on your phone, plug in the player, then link its Music folder.',
    );
  }

  let picked: Directory;
  try {
    picked = await Directory.pickDirectoryAsync();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/cancel/i.test(message)) return null;
    throw error;
  }

  if (!picked?.uri) {
    return null;
  }

  return linkUsbPlayerDirectory(picked.uri, library);
}

export function linkUsbPlayerDirectory(
  rootUri: string,
  library: Track[],
): UsbLinkResult {
  const root = openDirectory(rootUri);
  const musicDir = resolveMusicDirectory(root);
  const manifest = readManifest(musicDir);
  const files = listMp3Files(musicDir);
  const libraryByFile = new Map(
    library.map((t) => [t.fileName.toLowerCase(), t] as const),
  );

  const fileNames: Record<string, string> = {};
  const trackIds: string[] = [];
  const claimedFiles = new Set<string>();
  let usedBytes = 0;

  for (const [trackId, meta] of Object.entries(manifest.tracks)) {
    const onDisk = files.find(
      (f) => f.name.toLowerCase() === meta.fileName.toLowerCase(),
    );
    if (!onDisk) continue;
    fileNames[trackId] = onDisk.name;
    trackIds.push(trackId);
    claimedFiles.add(onDisk.name.toLowerCase());
    usedBytes += meta.sizeBytes || onDisk.size || 0;
  }

  const orphanFiles: string[] = [];
  for (const file of files) {
    const key = file.name.toLowerCase();
    if (claimedFiles.has(key)) continue;
    const matched = libraryByFile.get(key);
    if (matched) {
      fileNames[matched.id] = file.name;
      trackIds.push(matched.id);
      claimedFiles.add(key);
      usedBytes += matched.sizeBytes || file.size || 0;
    } else {
      orphanFiles.push(file.name);
      usedBytes += file.size || 0;
    }
  }

  const device: PlayerDevice = {
    id: `usb-${Date.now().toString(36)}`,
    name: root.name || musicDir.name || 'USB Player',
    model: 'Mass-storage MP3 player',
    capacityBytes: estimateCapacity(musicDir, usedBytes),
    usedBytes,
    connected: true,
    isDemo: false,
    rootUri: musicDir.uri,
    fileNames,
    trackIds: [...new Set(trackIds)],
    lastSyncedAt: null,
    needsRelink: false,
  };

  return { device, orphanFiles };
}

/**
 * Re-open a previously linked folder. On iOS, security-scoped access expires
 * after process death — returns needsRelink when the URI is no longer readable.
 */
export function tryRestoreUsbPlayer(
  device: PlayerDevice,
  library: Track[],
): PlayerDevice {
  if (device.isDemo || !device.rootUri) {
    return device;
  }

  try {
    const dir = openDirectory(device.rootUri);
    if (!dir.exists) {
      return { ...device, connected: false, needsRelink: true };
    }
    const refreshed = linkUsbPlayerDirectory(device.rootUri, library).device;
    return {
      ...refreshed,
      id: device.id,
      name: device.name,
      lastSyncedAt: device.lastSyncedAt,
    };
  } catch {
    return { ...device, connected: false, needsRelink: true };
  }
}

export type UsbSyncProgress = (label: string, completed: number, total: number) => void;

/**
 * Copies / deletes real MP3 files on the linked USB music folder according to the plan.
 */
export async function executeUsbSync(options: {
  device: PlayerDevice;
  plan: SyncPlanItem[];
  libraryById: Map<string, Track>;
  onProgress?: UsbSyncProgress;
}): Promise<PlayerDevice> {
  const { device, plan, libraryById, onProgress } = options;
  if (!device.rootUri) {
    throw new Error('No USB folder linked.');
  }

  const musicDir = openDirectory(device.rootUri);
  if (!musicDir.exists) {
    throw new Error(
      'Lost access to the player folder. Open Player and link the USB Music folder again.',
    );
  }

  const actionable = plan.filter((p) => p.action !== 'keep');
  const manifest = readManifest(musicDir);
  const fileNames: Record<string, string> = { ...device.fileNames };
  const usedNames = new Set(
    Object.values(fileNames).map((n) => n.toLowerCase()),
  );

  for (let i = 0; i < actionable.length; i += 1) {
    const item = actionable[i];
    const track = libraryById.get(item.trackId);

    if (item.action === 'add') {
      if (!track?.uri) {
        throw new Error(
          `"${track?.title ?? 'Track'}" has no local file. Import the MP3 before syncing to USB.`,
        );
      }
      const source = new File(track.uri);
      if (!source.exists) {
        throw new Error(
          `Missing local file for "${track.title}". Re-import it, then sync again.`,
        );
      }

      const preferred = track.fileName || `${track.title}.mp3`;
      const destName = uniqueFileName(preferred, usedNames);
      const destination = new File(musicDir, destName);

      onProgress?.(`Copying ${track.title}…`, i, actionable.length);
      await source.copy(destination, { overwrite: true });

      fileNames[track.id] = destName;
      manifest.tracks[track.id] = {
        fileName: destName,
        title: track.title,
        sizeBytes: track.sizeBytes || destination.size || 0,
      };
    }

    if (item.action === 'remove') {
      const name = fileNames[item.trackId] ?? manifest.tracks[item.trackId]?.fileName;
      const title = track?.title ?? name ?? 'track';
      onProgress?.(`Removing ${title}…`, i, actionable.length);

      if (name) {
        const target = new File(musicDir, name);
        if (target.exists) {
          target.delete();
        }
        usedNames.delete(name.toLowerCase());
      }
      delete fileNames[item.trackId];
      delete manifest.tracks[item.trackId];
    }
  }

  writeManifest(musicDir, manifest);

  const nextIds = new Set(device.trackIds);
  for (const item of plan) {
    if (item.action === 'add' || item.action === 'keep') nextIds.add(item.trackId);
    if (item.action === 'remove') nextIds.delete(item.trackId);
  }

  let usedBytes = 0;
  for (const id of nextIds) {
    const meta = manifest.tracks[id];
    const track = libraryById.get(id);
    usedBytes += meta?.sizeBytes ?? track?.sizeBytes ?? 0;
  }

  return {
    ...device,
    trackIds: [...nextIds],
    fileNames,
    usedBytes,
    connected: true,
    needsRelink: false,
    lastSyncedAt: new Date().toISOString(),
    capacityBytes: Math.max(device.capacityBytes, usedBytes + 256 * 1024 * 1024),
  };
}
