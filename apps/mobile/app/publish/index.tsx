import { router, Stack, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const OPTIONS = [
  {
    id: 'post',
    emoji: '🍩',
    title: '发布到萌壳圈',
    desc: '分享萌宠日常、心情或趣事',
    href: '/publish/post' as const,
  },
  {
    id: 'party',
    emoji: '🎉',
    title: '发起派对匹配',
    desc: '随机匹配一位萌宠伙伴，一起玩派对游戏',
    href: '/publish/party-match' as const,
  },
];

export default function PublishMenuScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: '发布' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>选择你想做的事</Text>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => router.push(opt.href as Href)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={styles.emoji}>{opt.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.title, { color: colors.text }]}>{opt.title}</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{opt.desc}</Text>
            </View>
          </Pressable>
        ))}
        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>取消</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  hint: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  emoji: {
    fontSize: 36,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cancel: {
    marginTop: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
  },
});
