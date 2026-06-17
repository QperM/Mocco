import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PublicPetAvatar from '@/components/PublicPetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PET_STYLE_EMOJI, type PetStyle } from '@/lib/types';

const SHOWCASE_PETS: PetStyle[] = ['cat', 'dog', 'rabbit', 'fox', 'hamster'];

export default function WelcomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.hero}>
        <Text style={[styles.logo, { color: colors.tint }]}>Mocco</Text>
        <Text style={[styles.title, { color: colors.text }]}>萌壳匿名社交</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          上传宠物照片生成萌壳，在萌壳圈分享日常、结识同好
        </Text>
      </View>

      <View style={styles.petRow}>
        {SHOWCASE_PETS.map((style) => (
          <View key={style} style={[styles.petBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.petEmoji}>{PET_STYLE_EMOJI[style]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.centerPet}>
        <PublicPetAvatar petStyle="cat" size={140} />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryBtnText}>登录</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryBtn, { borderColor: colors.tint }]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.tint }]}>注册新账号</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  petRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  petBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: {
    fontSize: 26,
  },
  centerPet: {
    alignItems: 'center',
    marginBottom: 36,
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
