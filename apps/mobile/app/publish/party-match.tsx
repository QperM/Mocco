import { router, Stack, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import PetAvatar from '@/components/PetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const MATCH_NAMES = ['团子#1092', '元气#7731', '神秘#4521', '治愈#8834'];
const MATCH_STYLES = ['rabbit', 'dog', 'fox', 'hamster'] as const;

export default function PartyMatchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [matching, setMatching] = useState(true);
  const [matchIndex, setMatchIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatchIndex(Math.floor(Math.random() * MATCH_NAMES.length));
      setMatching(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const startParty = () => {
    router.replace('/party/rps' as Href);
  };

  return (
    <>
      <Stack.Screen options={{ title: '派对匹配' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {matching ? (
          <>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.title, { color: colors.text }]}>正在为你匹配派对伙伴…</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>
              寻找同频的萌宠中 🎉
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={[styles.title, { color: colors.text }]}>匹配成功！</Text>
            <PetAvatar petStyle={MATCH_STYLES[matchIndex]} size={100} />
            <Text style={[styles.partner, { color: colors.text }]}>{MATCH_NAMES[matchIndex]}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>
              来一局萌宠猜拳，开启你们的派对吧
            </Text>
            <Pressable onPress={startParty} style={[styles.btn, { backgroundColor: colors.tint }]}>
              <Text style={styles.btnText}>开始派对游戏</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.skip}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>稍后再玩</Text>
            </Pressable>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  matchEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  partner: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skip: {
    marginTop: 16,
    padding: 10,
  },
  skipText: {
    fontSize: 14,
  },
});
