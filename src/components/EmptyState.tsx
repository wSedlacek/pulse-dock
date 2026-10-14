import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
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
    color: colors.chalk,
  },
  body: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.mist,
    maxWidth: 320,
  },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
