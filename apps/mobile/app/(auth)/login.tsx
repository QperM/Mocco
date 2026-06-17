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

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const isSyncing = useAuthStore((s) => s.isSyncing);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }

    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('登录失败', formatAuthError(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.desc, { color: colors.textSecondary }]}>使用邮箱登录你的萌壳账号</Text>

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
        placeholder="密码"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.btn, { backgroundColor: colors.tint, opacity: isSyncing ? 0.7 : 1 }]}
        onPress={submit}
        disabled={isSyncing}
      >
        {isSyncing ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>登录</Text>}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={[styles.link, { color: colors.tint }]}>还没有账号？去注册</Text>
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
    marginBottom: 24,
    lineHeight: 20,
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
