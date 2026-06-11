import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LocalModeBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (isSupabaseConfigured) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.accent }]}>
      <Text style={styles.text}>
        本地预览模式 · 配置 Supabase 后可同步数据
      </Text>
    </View>
  );
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
  },
});
