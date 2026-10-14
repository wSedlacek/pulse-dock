import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import type { Track } from '../types/music';
import { titleFromFileName } from '../utils/format';

function makeId(): string {
  return `track-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function pickMp3Files(): Promise<Track[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['audio/mpeg', 'audio/mp3', 'audio/*'],
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset) => {
    const fileName = asset.name || `track-${Date.now()}.mp3`;
    return {
      id: makeId(),
      title: titleFromFileName(fileName),
      artist: 'Unknown Artist',
      album: 'Imported',
      durationSec: 0,
      sizeBytes: asset.size ?? 3_500_000,
      uri: asset.uri,
      fileName,
      addedAt: new Date().toISOString(),
      isDemo: false,
    } satisfies Track;
  });
}

export function importHint(): string {
  if (Platform.OS === 'web') {
    return 'Import MP3s from this computer, then sync them to a demo player or export for your device.';
  }
  return 'Import MP3s from Files, Files apps, or cloud storage. Connect a USB MP3 player with a USB-C adapter to manage what lives on the player.';
}
