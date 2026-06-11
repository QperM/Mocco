import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';

import LocalModeBanner from '@/components/LocalModeBanner';
import PetAvatar from '@/components/PetAvatar';
import PublicPetAvatar from '@/components/PublicPetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { hasCustomAvatar } from '@/lib/default-pet';
import { PET_STYLE_LABEL, type PetStyle } from '@/lib/types';
import { useAuthStore } from '@/stores/useAuthStore';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { profile, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const petStyle = (profile?.pet_style ?? 'cat') as PetStyle;
  const customAvatar = hasCustomAvatar(profile?.avatar_url);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocalModeBanner />

      <View style={styles.hero}>
        {customAvatar ? (
          <PetAvatar uri={profile.avatar_url} petStyle={petStyle} size={160} />
        ) : (
          <PublicPetAvatar petStyle={petStyle} size={160} />
        )}

        <Text style={[styles.name, { color: colors.text }]}>
          {profile?.anonymous_name ?? '萌萌'}
        </Text>

        {customAvatar ? (
          <Text style={[styles.styleLabel, { color: colors.textSecondary }]}>
            {PET_STYLE_LABEL[petStyle]}皮套 · 你的专属形象
          </Text>
        ) : (
          <Text style={[styles.guideText, { color: colors.textSecondary }]}>
            这是大家的公共萌宠形象{'\n'}上传宠物照片，生成你的专属皮套吧
          </Text>
        )}

        {profile?.bio && customAvatar ? (
          <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/pet/create')}
        >
          <Text style={styles.primaryBtnText}>
            {customAvatar ? '重新生成我的形象' : '创建我的萌宠形象'}
          </Text>
        </Pressable>

        {!customAvatar ? (
          <Text style={[styles.actionHint, { color: colors.textSecondary }]}>
            支持上传 1–3 张宠物照片，一键生成 2D 萌宠头像
          </Text>
        ) : null}
      </View>

      <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>💡 匿名社交</Text>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          在广场和聊天中，大家只会看到你的萌宠皮套和匿名昵称，真实身份完全隐藏。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },
  styleLabel: {
    fontSize: 14,
    marginTop: 6,
  },
  guideText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  bio: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  actionHint: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  tipCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
