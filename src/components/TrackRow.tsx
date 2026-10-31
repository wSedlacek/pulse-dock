import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
} from 'react-native';
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

const DELETE_WIDTH = 80;
/** Progress past the open panel — commit delete on finger release (Mail). */
const FULL_SWIPE_PROGRESS = 1.85;

type Props = {
  track: Track;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  trailingLabel?: string;
  mode?: 'select' | 'plain';
  showSeparator?: boolean;
  swipeOpenId?: string | null;
  onSwipeOpenChange?: (id: string | null) => void;
};

function RowIcon({
  name,
  color,
  size = 22,
}: {
  name: 'checkmark.circle.fill' | 'circle' | 'music.note';
  color: ColorValue;
  size?: number;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={name} tintColor={color} size={size} />;
  }
  const map = {
    'checkmark.circle.fill': 'checkmark-circle' as const,
    circle: 'ellipse-outline' as const,
    'music.note': 'musical-note' as const,
  };
  return <Ionicons name={map[name]} size={size} color={color as string} />;
}

function DeleteAction({
  progress,
  translation,
  onDelete,
  onCrossFullSwipe,
}: {
  progress: SharedValue<number>;
  translation: SharedValue<number>;
  onDelete: () => void;
  onCrossFullSwipe: (crossed: boolean) => void;
}) {
  const { colors } = useTheme();

  useAnimatedReaction(
    () => progress.value,
    (value, prev) => {
      const crossed = value >= FULL_SWIPE_PROGRESS;
      const wasCrossed = (prev ?? 0) >= FULL_SWIPE_PROGRESS;
      if (crossed !== wasCrossed) {
        runOnJS(onCrossFullSwipe)(crossed);
      }
    },
    [onCrossFullSwipe],
  );

  const style = useAnimatedStyle(() => {
    const width = interpolate(
      translation.value,
      [0, -DELETE_WIDTH],
      [0, DELETE_WIDTH],
      Extrapolation.CLAMP,
    );
    const overshoot = interpolate(
      progress.value,
      [1, 2.2],
      [0, 48],
      Extrapolation.CLAMP,
    );
    return { width: Math.max(width + overshoot, 0) };
  });

  return (
    <Animated.View style={[styles.deleteWrap, style]}>
      <RectButton
        style={[styles.deleteBtn, { backgroundColor: colors.danger }]}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete"
      >
        <Text style={[typography.headline, { color: colors.onTint }]}>Delete</Text>
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
  const fullSwipeArmed = useRef(false);
  const didThresholdHaptic = useRef(false);

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
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    swipeRef.current?.close();
    onSwipeOpenChange?.(null);
    onRemove?.();
  }, [onRemove, onSwipeOpenChange]);

  const onCrossFullSwipe = useCallback((crossed: boolean) => {
    fullSwipeArmed.current = crossed;
    if (crossed && !didThresholdHaptic.current) {
      didThresholdHaptic.current = true;
      if (Platform.OS === 'ios') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    if (!crossed) {
      didThresholdHaptic.current = false;
    }
  }, []);

  const renderRightActions = (
    progress: SharedValue<number>,
    translation: SharedValue<number>,
  ) => (
    <DeleteAction
      progress={progress}
      translation={translation}
      onDelete={performRemove}
      onCrossFullSwipe={onCrossFullSwipe}
    />
  );

  const subtitle = [
    track.artist,
    track.durationSec > 0 ? formatDuration(track.durationSec) : null,
    formatBytes(track.sizeBytes),
  ]
    .filter(Boolean)
    .join(' · ');

  const row = (
    <Pressable
      accessibilityRole={mode === 'select' ? 'checkbox' : 'button'}
      accessibilityState={mode === 'select' ? { checked: !!selected } : undefined}
      accessibilityLabel={`${track.title}. ${subtitle}`}
      accessibilityActions={
        onRemove ? [{ name: 'delete', label: 'Delete' }] : undefined
      }
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'delete') performRemove();
      }}
      onPress={
        mode === 'select'
          ? () => {
              if (Platform.OS === 'ios') void Haptics.selectionAsync();
              if (swipeOpenId) onSwipeOpenChange?.(null);
              onToggle?.();
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.fill : colors.secondaryGrouped,
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
            {subtitle}
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
      rightThreshold={DELETE_WIDTH * 0.55}
      overshootRight
      overshootFriction={8}
      enableTrackpadTwoFingerGesture
      containerStyle={styles.swipeContainer}
      renderRightActions={renderRightActions}
      onSwipeableOpenStartDrag={() => {
        fullSwipeArmed.current = false;
        didThresholdHaptic.current = false;
        onSwipeOpenChange?.(track.id);
      }}
      onSwipeableOpen={(direction) => {
        if (direction !== SwipeDirection.LEFT) return;
        // Commit only on finger release after crossing the full-swipe threshold.
        if (fullSwipeArmed.current) {
          performRemove();
          return;
        }
        onSwipeOpenChange?.(track.id);
      }}
      onSwipeableClose={() => {
        if (swipeOpenId === track.id) onSwipeOpenChange?.(null);
        fullSwipeArmed.current = false;
        didThresholdHaptic.current = false;
      }}
    >
      {row}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    overflow: 'hidden',
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
    paddingHorizontal: 16,
  },
});
