import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Choice = 'rock' | 'paper' | 'scissors';
type RoundResult = 'win' | 'lose' | 'draw';

const CHOICES: { key: Choice; emoji: string; label: string }[] = [
  { key: 'rock', emoji: '✊', label: '石头' },
  { key: 'paper', emoji: '✋', label: '布' },
  { key: 'scissors', emoji: '✌️', label: '剪刀' },
];

function getResult(mine: Choice, theirs: Choice): RoundResult {
  if (mine === theirs) return 'draw';
  if (
    (mine === 'rock' && theirs === 'scissors') ||
    (mine === 'paper' && theirs === 'rock') ||
    (mine === 'scissors' && theirs === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
}

export default function RpsGameScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [myScore, setMyScore] = useState(0);
  const [theirScore, setTheirScore] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  const play = (choice: Choice) => {
    const theirs = CHOICES[Math.floor(Math.random() * 3)].key;
    const result = getResult(choice, theirs);
    const theirsLabel = CHOICES.find((c) => c.key === theirs)!.label;
    const mineLabel = CHOICES.find((c) => c.key === choice)!.label;

    let msg = '';
    if (result === 'win') {
      setMyScore((s) => s + 1);
      msg = `你出${mineLabel}，对方出${theirsLabel} — 你赢了！`;
    } else if (result === 'lose') {
      setTheirScore((s) => s + 1);
      msg = `你出${mineLabel}，对方出${theirsLabel} — 你输了`;
    } else {
      msg = `你出${mineLabel}，对方出${theirsLabel} — 平局`;
    }

    setLastResult(msg);
    setRound((r) => r + 1);
  };

  const gameOver = myScore >= 2 || theirScore >= 2;

  return (
    <>
      <Stack.Screen options={{ title: '萌宠猜拳' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.scoreBoard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.score, { color: colors.text }]}>你 {myScore}</Text>
          <Text style={[styles.vs, { color: colors.textSecondary }]}>VS</Text>
          <Text style={[styles.score, { color: colors.text }]}>对方 {theirScore}</Text>
        </View>
        <Text style={[styles.rule, { color: colors.textSecondary }]}>三局两胜 · 派对猜拳对决</Text>

        {lastResult ? (
          <Text style={[styles.result, { color: colors.text }]}>{lastResult}</Text>
        ) : (
          <Text style={[styles.result, { color: colors.textSecondary }]}>选出一个手势吧</Text>
        )}

        {gameOver ? (
          <View style={[styles.winBanner, { backgroundColor: colors.tint }]}>
            <Text style={styles.winText}>
              {myScore > theirScore ? '🎉 派对胜利！' : '😿 下次派对再来～'}
            </Text>
          </View>
        ) : (
          <View style={styles.choices}>
            {CHOICES.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => play(c.key)}
                style={[styles.choiceBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={styles.choiceEmoji}>{c.emoji}</Text>
                <Text style={[styles.choiceLabel, { color: colors.text }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={[styles.round, { color: colors.textSecondary }]}>第 {round} 局</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 24,
    marginBottom: 12,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
  },
  vs: {
    fontSize: 16,
  },
  rule: {
    fontSize: 13,
    marginBottom: 32,
  },
  result: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  choices: {
    flexDirection: 'row',
    gap: 16,
  },
  choiceBtn: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 90,
  },
  choiceEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  winBanner: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  winText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  round: {
    marginTop: 32,
    fontSize: 13,
  },
});
