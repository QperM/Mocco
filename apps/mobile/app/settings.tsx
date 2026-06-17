import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { PET_STYLE_EMOJI, PET_STYLE_LABEL, type PetStyle } from '@/lib/types';
import { useAuthStore } from '@/stores/useAuthStore';

const STYLES: PetStyle[] = ['cat', 'dog', 'rabbit', 'hamster', 'fox'];

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { email, profile, isAuthenticated, isLocalMode, updateProfile, signOut, isSyncing } = useAuthStore();
  const [name, setName] = useState(profile?.anonymous_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [petStyle, setPetStyle] = useState<PetStyle>((profile?.pet_style as PetStyle) ?? 'cat');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        anonymous_name: name.trim() || profile.anonymous_name,
        bio: bio.trim(),
        pet_style: petStyle,
      });
      Alert.alert('已保存', '账号资料已更新');
    } catch (err) {
      Alert.alert('保存失败', err instanceof Error ? err.message : '请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('提示', '新密码至少 6 位');
      return;
    }
    if (!isSupabaseConfigured) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      Alert.alert('已更新', '密码修改成功');
    } catch (err) {
      Alert.alert('修改失败', err instanceof Error ? err.message : '请稍后重试');
    }
  };

  const logout = () => {
    Alert.alert('退出登录', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: '设置' }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>账号信息</Text>
          {email ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>登录邮箱：{email}</Text>
          ) : (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {isLocalMode ? '本地预览模式' : '未登录'}
            </Text>
          )}
        </View>

        {isAuthenticated && !isLocalMode ? (
          <>
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>萌壳资料</Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>匿名昵称</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="萌壳昵称"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>个性签名</Text>
              <TextInput
                style={[styles.input, styles.bioInput, { color: colors.text, borderColor: colors.border }]}
                value={bio}
                onChangeText={setBio}
                placeholder="写一句介绍..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>萌壳风格</Text>
              <View style={styles.styleRow}>
                {STYLES.map((style) => (
                  <Pressable
                    key={style}
                    onPress={() => setPetStyle(style)}
                    style={[
                      styles.styleChip,
                      {
                        backgroundColor: petStyle === style ? colors.tint : colors.background,
                        borderColor: petStyle === style ? colors.tint : colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.styleEmoji}>{PET_STYLE_EMOJI[style]}</Text>
                    <Text style={{ color: petStyle === style ? '#fff' : colors.text, fontSize: 12 }}>
                      {PET_STYLE_LABEL[style]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[styles.btn, { backgroundColor: colors.tint, opacity: saving ? 0.7 : 1 }]}
                onPress={saveProfile}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>保存资料</Text>}
              </Pressable>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>修改密码</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="新密码（至少 6 位）"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <Pressable style={[styles.btnOutline, { borderColor: colors.tint }]} onPress={changePassword}>
                <Text style={[styles.btnOutlineText, { color: colors.tint }]}>更新密码</Text>
              </Pressable>
            </View>

            <Pressable style={[styles.logoutBtn, { borderColor: '#E53935' }]} onPress={logout} disabled={isSyncing}>
              <Text style={styles.logoutText}>退出登录</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  meta: { fontSize: 14 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  styleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  styleEmoji: { fontSize: 16 },
  btn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnOutline: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  btnOutlineText: { fontSize: 15, fontWeight: '600' },
  logoutBtn: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 8,
  },
  logoutText: { color: '#E53935', fontSize: 16, fontWeight: '600' },
});
