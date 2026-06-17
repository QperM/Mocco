import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LocalModeBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLocalMode = useAuthStore((s) => s.isLocalMode);

  if (!isSupabaseConfigured) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.accent }]}>
        <Text style={styles.text}>本地预览 · 在 .env 配置 Supabase 后可同步云端数据</Text>
      </View>
    );
  }

  if (isLocalMode) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.accent }]}>
        <Text style={styles.text}>云端连接失败 · 已回退本地模式，请检查网络与 Supabase 配置</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
});
