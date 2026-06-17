import { router, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const SPRING = { damping: 14, stiffness: 220, mass: 0.8 };

const BUBBLES = [
  {
    id: 'post',
    emoji: '🍩',
    label: '发布萌壳圈',
    href: '/publish/post' as Href,
    offsetX: -88,
    offsetY: -100,
  },
  {
    id: 'party',
    emoji: '🎉',
    label: '发起派对',
    href: '/publish/party-match' as Href,
    offsetX: 88,
    offsetY: -100,
  },
] as const;

function ActionBubble({
  emoji,
  label,
  offsetX,
  offsetY,
  progress,
  colors,
  onPress,
}: {
  emoji: string;
  label: string;
  offsetX: number;
  offsetY: number;
  progress: SharedValue<number>;
  colors: (typeof Colors)['light'];
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, offsetX]) },
      { translateY: interpolate(progress.value, [0, 1], [0, offsetY]) },
      { scale: interpolate(progress.value, [0, 1], [0.25, 1]) },
    ],
  }));

  return (
    <Animated.View style={[styles.bubbleWrap, style]}>
      <Pressable
        onPress={onPress}
        style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={styles.bubbleEmoji}>{emoji}</Text>
        <Text style={[styles.bubbleLabel, { color: colors.text }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PublishTabButton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const progress = useSharedValue(0);

  const anchorX = width / 2;
  const anchorY = 28;

  const open = useCallback(() => {
    setVisible(true);
    progress.value = withSpring(1, SPRING);
  }, [progress]);

  const close = useCallback(() => {
    progress.value = withSpring(0, SPRING);
    setTimeout(() => setVisible(false), 200);
  }, [progress]);

  const toggle = useCallback(() => {
    if (visible) close();
    else open();
  }, [visible, open, close]);

  const navigate = useCallback(
    (href: Href) => {
      close();
      setTimeout(() => router.push(href), 180);
    },
    [close],
  );

  const fabRotate = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  return (
    <>
      <Pressable
        onPress={toggle}
        style={styles.wrap}
        accessibilityRole="button"
        accessibilityLabel={visible ? '关闭发布菜单' : '发布'}
      >
        <Animated.View
          style={[
            styles.btn,
            { backgroundColor: colors.tint, borderColor: colors.card },
            fabRotate,
          ]}
        >
          <Text style={styles.plus}>＋</Text>
        </Animated.View>
        <Text style={[styles.label, { color: colors.tint }]}>发布</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={close}>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </Pressable>

          <View
            style={[styles.anchor, { left: anchorX - 26, bottom: 54 }]}
            pointerEvents="box-none"
          >
            {BUBBLES.map((b) => (
              <ActionBubble
                key={b.id}
                emoji={b.emoji}
                label={b.label}
                offsetX={b.offsetX}
                offsetY={b.offsetY}
                progress={progress}
                colors={colors}
                onPress={() => navigate(b.href)}
              />
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -8,
  },
  btn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  plus: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(61, 54, 48, 0.35)',
  },
  anchor: {
    position: 'absolute',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  bubble: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  bubbleEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  bubbleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
