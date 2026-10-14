import type { PlayerDevice, SyncPlanItem, Track } from '../types/music';

export function buildSyncPlan(
  library: Track[],
  device: PlayerDevice | null,
  selectedIds: string[],
): SyncPlanItem[] {
  if (!device) return [];

  const selected = new Set(selectedIds);
  const onDevice = new Set(device.trackIds);
  const libraryIds = new Set(library.map((t) => t.id));
  const plan: SyncPlanItem[] = [];

  for (const id of selected) {
    if (!libraryIds.has(id)) continue;
    plan.push({ trackId: id, action: onDevice.has(id) ? 'keep' : 'add' });
  }

  for (const id of onDevice) {
    if (!selected.has(id)) {
      plan.push({ trackId: id, action: 'remove' });
    }
  }

  return plan.sort((a, b) => {
    const order = { add: 0, remove: 1, keep: 2 } as const;
    return order[a.action] - order[b.action];
  });
}

export function estimatePlanBytes(
  plan: SyncPlanItem[],
  libraryById: Map<string, Track>,
): { addBytes: number; removeBytes: number; keepBytes: number } {
  let addBytes = 0;
  let removeBytes = 0;
  let keepBytes = 0;

  for (const item of plan) {
    const track = libraryById.get(item.trackId);
    if (!track) continue;
    if (item.action === 'add') addBytes += track.sizeBytes;
    if (item.action === 'remove') removeBytes += track.sizeBytes;
    if (item.action === 'keep') keepBytes += track.sizeBytes;
  }

  return { addBytes, removeBytes, keepBytes };
}

export function applySyncPlan(
  device: PlayerDevice,
  plan: SyncPlanItem[],
  libraryById: Map<string, Track>,
): PlayerDevice {
  const nextIds = new Set(device.trackIds);

  for (const item of plan) {
    if (item.action === 'add' || item.action === 'keep') {
      nextIds.add(item.trackId);
    }
    if (item.action === 'remove') {
      nextIds.delete(item.trackId);
    }
  }

  const usedBytes = [...nextIds].reduce((sum, id) => {
    const track = libraryById.get(id);
    return sum + (track?.sizeBytes ?? 0);
  }, 0);

  return {
    ...device,
    trackIds: [...nextIds],
    usedBytes,
    lastSyncedAt: new Date().toISOString(),
    connected: true,
  };
}

export function wouldExceedCapacity(
  device: PlayerDevice,
  plan: SyncPlanItem[],
  libraryById: Map<string, Track>,
): boolean {
  const { addBytes, removeBytes, keepBytes } = estimatePlanBytes(plan, libraryById);
  const projected = keepBytes + addBytes;
  // removeBytes frees space but projected already excludes removals
  void removeBytes;
  return projected > device.capacityBytes;
}
