import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.chalk }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.mist }]}>{body}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 36,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
  },
  body: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
