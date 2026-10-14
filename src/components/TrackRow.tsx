import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import type { Track } from '../types/music';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';
import { formatBytes, formatDuration } from '../utils/format';

const DELETE_WIDTH = 84;

type Props = {
  track: Track;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  trailingLabel?: string;
  mode?: 'select' | 'plain';
  showSeparator?: boolean;
  /** Only one row should stay open — parent tracks the active id. */
  swipeOpenId?: string | null;
  onSwipeOpenChange?: (id: string | null) => void;
};

function RowIcon({
  name,
  color,
  size = 22,
}: {
  name: 'checkmark.circle.fill' | 'circle' | 'music.note' | 'trash.fill';
  color: string;
  size?: number;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={name} tintColor={color} size={size} />;
  }
  const map = {
    'checkmark.circle.fill': 'checkmark-circle' as const,
    circle: 'ellipse-outline' as const,
    'music.note': 'musical-note' as const,
    'trash.fill': 'trash' as const,
  };
  return <Ionicons name={map[name]} size={size} color={color} />;
}

function DeleteAction({
  progress,
  translation,
  onDelete,
}: {
  progress: SharedValue<number>;
  translation: SharedValue<number>;
  onDelete: () => void;
}) {
  const { colors } = useTheme();

  const style = useAnimatedStyle(() => {
    const width = interpolate(
      translation.value,
      [0, -DELETE_WIDTH],
      [0, DELETE_WIDTH],
      Extrapolation.CLAMP,
    );
    // Stretch toward full-swipe Mail behavior once past the action width.
    const overshoot = interpolate(
      progress.value,
      [1, 2.2],
      [0, 40],
      Extrapolation.CLAMP,
    );
    return {
      width: width + overshoot,
    };
  });

  return (
    <Animated.View style={[styles.deleteWrap, style]}>
      <RectButton
        style={[styles.deleteBtn, { backgroundColor: colors.danger }]}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete"
      >
        <RowIcon name="trash.fill" color={colors.onTint} size={20} />
        <Text style={[typography.footnote, styles.deleteLabel, { color: colors.onTint }]}>
          Delete
        </Text>
      </RectButton>
    </Animated.View>
  );
}

export function TrackRow({
  track,
  selected,
  onToggle,
  onRemove,
  trailingLabel,
  mode = 'select',
  showSeparator = true,
  swipeOpenId,
  onSwipeOpenChange,
}: Props) {
  const { colors } = useTheme();
  const swipeRef = useRef<SwipeableMethods | null>(null);
  const checkScale = useSharedValue(selected ? 1 : 0.92);
  const committingFullSwipe = useRef(false);

  useEffect(() => {
    checkScale.value = withSpring(selected ? 1 : 0.92, {
      damping: 16,
      stiffness: 280,
    });
  }, [selected, checkScale]);

  useEffect(() => {
    if (swipeOpenId !== track.id) {
      swipeRef.current?.close();
    }
  }, [swipeOpenId, track.id]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const performRemove = useCallback(() => {
    if (Platform.OS === 'ios') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    swipeRef.current?.close();
    onSwipeOpenChange?.(null);
    onRemove?.();
  }, [onRemove, onSwipeOpenChange]);

  const maybeFullSwipeDelete = useCallback(
    (progress: number) => {
      if (!onRemove || committingFullSwipe.current) return;
      if (progress > 2.05) {
        committingFullSwipe.current = true;
        performRemove();
      }
    },
    [onRemove, performRemove],
  );

  const renderRightActions = (
    progress: SharedValue<number>,
    translation: SharedValue<number>,
  ) => {
    return (
      <FullSwipeWatcher progress={progress} onThreshold={maybeFullSwipeDelete}>
        <DeleteAction
          progress={progress}
          translation={translation}
          onDelete={performRemove}
        />
      </FullSwipeWatcher>
    );
  };

  const row = (
    <Pressable
      accessibilityRole={mode === 'select' ? 'checkbox' : 'none'}
      accessibilityState={mode === 'select' ? { checked: !!selected } : undefined}
      accessibilityLabel={track.title}
      onPress={
        mode === 'select'
          ? () => {
              if (Platform.OS === 'ios') void Haptics.selectionAsync();
              // Close any open swipe before toggling.
              if (swipeOpenId) onSwipeOpenChange?.(null);
              onToggle?.();
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? colors.fill
            : colors.secondaryGrouped,
        },
      ]}
    >
      {mode === 'select' ? (
        <Animated.View style={checkStyle}>
          <RowIcon
            name={selected ? 'checkmark.circle.fill' : 'circle'}
            color={selected ? colors.tint : colors.tertiaryLabel}
          />
        </Animated.View>
      ) : (
        <View style={[styles.noteBadge, { backgroundColor: colors.tint }]}>
          <RowIcon name="music.note" color={colors.onTint} size={14} />
        </View>
      )}

      <View
        style={[
          styles.meta,
          showSeparator && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.separator,
          },
        ]}
      >
        <View style={styles.metaInner}>
          <Text style={[typography.body, { color: colors.label }]} numberOfLines={1}>
            {track.title}
          </Text>
          <Text
            style={[typography.subhead, { color: colors.secondaryLabel }]}
            numberOfLines={1}
          >
            {track.artist}
            {track.durationSec > 0 ? ` · ${formatDuration(track.durationSec)}` : ''}
            {` · ${formatBytes(track.sizeBytes)}`}
          </Text>
        </View>

        {trailingLabel ? (
          <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
            {trailingLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );

  if (!onRemove) {
    return row;
  }

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={40}
      overshootRight
      overshootFriction={8}
      enableTrackpadTwoFingerGesture
      containerStyle={styles.swipeContainer}
      childrenContainerStyle={styles.swipeChildren}
      renderRightActions={renderRightActions}
      onSwipeableOpenStartDrag={() => {
        if (Platform.OS === 'ios') void Haptics.selectionAsync();
        onSwipeOpenChange?.(track.id);
      }}
      onSwipeableOpen={(direction) => {
        if (direction === SwipeDirection.LEFT) {
          onSwipeOpenChange?.(track.id);
        }
      }}
      onSwipeableClose={() => {
        if (swipeOpenId === track.id) onSwipeOpenChange?.(null);
        committingFullSwipe.current = false;
      }}
    >
      {row}
    </Swipeable>
  );
}

/** Bridges Reanimated progress → JS so a hard full-swipe can commit delete. */
function FullSwipeWatcher({
  progress,
  onThreshold,
  children,
}: {
  progress: SharedValue<number>;
  onThreshold: (value: number) => void;
  children: ReactNode;
}) {
  useAnimatedReaction(
    () => progress.value,
    (value) => {
      if (value > 2.05) {
        runOnJS(onThreshold)(value);
      }
    },
    [onThreshold],
  );
  return <>{children}</>;
}

const styles = StyleSheet.create({
  swipeContainer: {
    overflow: 'hidden',
  },
  swipeChildren: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    minHeight: 60,
    gap: 12,
  },
  noteBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingRight: 16,
    minHeight: 60,
  },
  metaInner: {
    flex: 1,
    gap: 2,
  },
  deleteWrap: {
    height: '100%',
    overflow: 'hidden',
  },
  deleteBtn: {
    flex: 1,
    minWidth: DELETE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 12,
  },
  deleteLabel: {
    fontWeight: '600',
  },
});
