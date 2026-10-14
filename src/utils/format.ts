export function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '');
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
