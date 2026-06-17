import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import LocalModeBanner from '@/components/LocalModeBanner';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const PARTY_GAMES = [
  {
    id: 'rps',
    title: '萌宠猜拳',
    emoji: '✊',
    desc: '三局两胜，快速认识新朋友',
    href: '/party/rps' as const,
    ready: true,
  },
  {
    id: 'draw',
    title: '你画我猜',
    emoji: '🎨',
    desc: '一方画一方猜，派对默契大考验',
    href: '/party/rps' as const,
    ready: false,
  },
  {
    id: 'race',
    title: '宠物赛跑',
    emoji: '🏃',
    desc: '连点冲刺，看谁的小宠跑最快',
    href: '/party/rps' as const,
    ready: false,
  },
];

export default function PartyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LocalModeBanner />
      <Text style={[styles.intro, { color: colors.textSecondary }]}>
        来派对里玩小游戏，遇见同频的萌宠伙伴～
      </Text>
      {PARTY_GAMES.map((game) => (
        <Pressable
          key={game.id}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: game.ready ? 1 : 0.5 },
          ]}
          disabled={!game.ready}
          onPress={() => game.ready && router.push(game.href as Href)}
        >
          <Text style={styles.emoji}>{game.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={[styles.title, { color: colors.text }]}>
              {game.title}
              {!game.ready ? ' · 即将上线' : ''}
            </Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{game.desc}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    padding: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 36,
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
