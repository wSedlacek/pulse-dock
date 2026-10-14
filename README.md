# PulseDock

iPhone-hosted MP3 manager that **copies real MP3 files** onto a USB mass-storage MP3 player.

## How USB sync works

1. **Import** MP3s into the host library (Files / cloud / document picker). Files are copied into the app cache so Sync can read them.
2. **Player → Link USB Music Folder** opens the system directory picker. Choose the player under Files → Locations (iOS) or via Storage Access Framework (Android). Prefer the player’s `Music` / `MUSIC` folder.
3. **Library** — select the sync set.
4. **Sync → Copy Files to USB** — PulseDock:
   - **Add:** `File.copy()` each selected MP3 onto the linked folder
   - **Remove:** delete those files from the player
   - Writes a `.pulsedock-library.json` manifest so the next sync knows which host tracks map to which files

iOS grants folder access for the current app session. After a force-quit, use **Re-link** on the Player tab.

A **demo player** remains available for rehearsing the UI without hardware (no disk writes).

## Run locally

```bash
npm install
npm run web          # http://localhost:3847 — iPhone demo shell (web only)
npm run ios          # real app, no demo chrome
npm run android
```

The centered phone frame, status bar, and home indicator are a **web-only** injection (`src/demo/DemoPhoneShell`) that publishes matching safe-area insets. Native builds never include that chrome.

USB folder picking and file copy need a **native** build (iOS or Android). Web is for library/sync UX rehearsal.

```bash
npx expo prebuild
npx expo run:ios
# or: npx eas-cli@latest build --platform ios
```

## Hardware notes

Most budget USB-C / MTP-as-mass-storage MP3 players appear under **Files → Locations** when plugged into the iPhone with an adapter. PulseDock does not talk proprietary protocols — it writes standard `.mp3` files into the folder you grant.

Demo sample tracks are metadata-only; import real MP3s before syncing to USB.

## Stack

Expo **SDK 58** · React Native · Expo Router (Native Tabs) · `expo-file-system` (`Directory.pickDirectoryAsync`, `File.copy` / `delete`) · `expo-document-picker` · TypeScript
