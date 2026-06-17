import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { formatAuthError } from '@/lib/auth-errors';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const isSyncing = useAuthStore((s) => s.isSyncing);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('提示', '请填写邮箱和密码');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少 6 位');
      return;
    }
    if (password !== confirm) {
      Alert.alert('提示', '两次密码不一致');
      return;
    }

    try {
      await signUpWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('注册失败', formatAuthError(err), [
        { text: '去登录', onPress: () => router.replace('/(auth)/login') },
        { text: '知道了' },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.desc, { color: colors.textSecondary }]}>
        使用你的常用邮箱注册，注册后会自动分配萌壳匿名昵称，真实身份不会公开
      </Text>

      {__DEV__ ? (
        <Text style={[styles.tip, { color: colors.textSecondary }]}>
          [开发提示] 若频繁注册报 429，请在 Supabase 暂时关闭 Confirm email 或配置 SMTP
        </Text>
      ) : null}

      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        placeholder="邮箱"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        placeholder="密码（至少 6 位）"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        placeholder="确认密码"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <Pressable
        style={[styles.btn, { backgroundColor: colors.tint, opacity: isSyncing ? 0.7 : 1 }]}
        onPress={submit}
        disabled={isSyncing}
      >
        {isSyncing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>注册</Text>}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.link, { color: colors.tint }]}>已有账号？去登录</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  desc: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  tip: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  btn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
