import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlayerDevice, Track } from '../types/music';

const LIBRARY_KEY = 'pulsedock.library.v1';
const DEVICE_KEY = 'pulsedock.device.v1';
const SELECTION_KEY = 'pulsedock.selection.v1';

export async function loadLibrary(): Promise<Track[] | null> {
  const raw = await AsyncStorage.getItem(LIBRARY_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as Track[];
}

export async function saveLibrary(tracks: Track[]): Promise<void> {
  await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(tracks));
}

export async function loadDevice(): Promise<PlayerDevice | null> {
  const raw = await AsyncStorage.getItem(DEVICE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as PlayerDevice;
}

export async function saveDevice(device: PlayerDevice | null): Promise<void> {
  if (!device) {
    await AsyncStorage.removeItem(DEVICE_KEY);
    return;
  }
  await AsyncStorage.setItem(DEVICE_KEY, JSON.stringify(device));
}

export async function loadSelection(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SELECTION_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

export async function saveSelection(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(SELECTION_KEY, JSON.stringify(ids));
}
