# PulseDock

iPhone-hosted MP3 manager for syncing songs to a USB MP3 player.

PulseDock keeps your library on the phone, lets you build a sync set, then pushes adds/removes to a connected player. A demo **Nomad Clip** player is included so you can rehearse the full workflow without hardware.

## Features

- **Host library** — import MP3s from Files / cloud storage (or the browser on web)
- **Player view** — see capacity, songs on the device, connection state
- **Sync planner** — add / remove / keep diff with projected storage
- **Demo player** — practice transfers with sample tracks before plugging in hardware

## Run locally

```bash
npm install
npm run web          # http://localhost:3847
npm run ios          # Expo Go or simulator (macOS)
npm run android
```

For a native iOS build:

```bash
npx expo prebuild
npx expo run:ios
# or: npx eas-cli@latest build --platform ios
```

## Hardware notes

Many budget MP3 players mount as USB mass storage when connected with a USB-C adapter. PulseDock is designed around that host workflow:

1. Import and curate songs on the iPhone
2. Select the sync set in **Library**
3. Connect the player and run **Sync**

The demo player simulates the same add/remove transfer so you can validate the UX immediately. Direct write access to arbitrary USB volumes still depends on iOS Files / security-scoped folder APIs in a development build.

## Theme & native feel

Follows iOS Human Interface patterns:

- System-like light/dark grouped backgrounds and **systemBlue** accents (`userInterfaceStyle: automatic`)
- Large-title native stacks with blur headers
- Expo Router **Native Tabs** (`expo-router/unstable-native-tabs`) with SF Symbols / Material icons
- Inset-grouped lists, SF Symbols via `expo-symbols`, haptics via `expo-haptics`
- Web preview uses a centered iPhone shell with status bar + home indicator for demos

## Stack

Expo (SDK 57) · React Native · Expo Router · TypeScript · expo-system-ui · expo-document-picker · expo-symbols · expo-haptics · expo-blur
