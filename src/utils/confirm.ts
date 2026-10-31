import { Alert, Platform } from 'react-native';

/** Native action-sheet style confirm; web uses window.confirm. */
export function confirmDestructive(options: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}): Promise<boolean> {
  const {
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
  } = options;

  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : false,
    );
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: 'destructive',
        onPress: () => resolve(true),
      },
    ]);
  });
}
