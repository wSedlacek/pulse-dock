import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

const SEARCH_ROW = 44;
/** Hide once the list has scrolled past this offset (Settings / Mail style). */
const HIDE_AFTER = 28;

type Hook = {
  height: Animated.Value;
  visible: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

/**
 * Scroll-linked search chrome for web: tucked away while browsing the list,
 * revealed again when you pull/scroll back to the top — same idea as
 * UISearchController with hideWhenScrolling.
 */
export function usePullToRevealSearch(enabled: boolean): Hook {
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);
  const [height] = useState(() => new Animated.Value(SEARCH_ROW));

  const animate = useCallback(
    (open: boolean) => {
      if (visibleRef.current === open) return;
      visibleRef.current = open;
      setVisible(open);
      Animated.timing(height, {
        toValue: open ? SEARCH_ROW : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [height],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!enabled) return;
      const y = event.nativeEvent.contentOffset.y;
      if (y <= 4) {
        animate(true);
      } else if (y > HIDE_AFTER) {
        animate(false);
      }
    },
    [animate, enabled],
  );

  return { height, visible, onScroll };
}

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  height: Animated.Value;
  placeholder?: string;
};

export function PullToRevealSearch({
  value,
  onChangeText,
  height,
  placeholder = 'Search',
}: Props) {
  const { colors } = useTheme();

  if (Platform.OS !== 'web') return null;

  return (
    <Animated.View style={[styles.wrap, { height }]}>
      <View style={[styles.field, { backgroundColor: colors.fill }]}>
        <Ionicons name="search" size={16} color={colors.tertiaryLabel as string} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiaryLabel}
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={[typography.body, styles.input, { color: colors.label }]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  field: {
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 36,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
});
