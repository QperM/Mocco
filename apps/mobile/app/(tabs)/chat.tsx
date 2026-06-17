import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import LocalModeBanner from '@/components/LocalModeBanner';
import PetAvatar from '@/components/PetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useConversations } from '@/hooks/useConversations';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLocalMode = useAuthStore((s) => s.isLocalMode);
  const { data: conversations, isLoading, isRefetching, refetch, error } = useConversations();

  const showEmpty = isSupabaseConfigured && !isLocalMode;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocalModeBanner />

      {error && showEmpty ? (
        <Text style={[styles.error, { color: colors.textSecondary }]}>加载失败：{error.message}</Text>
      ) : null}

      {isLoading && showEmpty ? (
        <ActivityIndicator style={styles.loader} color={colors.tint} />
      ) : (
        <FlatList
          data={showEmpty ? (conversations ?? []) : []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={conversations?.length ? styles.list : styles.emptyList}
          refreshControl={
            showEmpty ? (
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.tint} />
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              emoji="💬"
              title="还没有消息"
              subtitle={
                isLocalMode || !isSupabaseConfigured
                  ? '配置 Supabase 后，在萌壳圈或派对中认识新朋友'
                  : '在萌壳圈互动，或发起派对匹配开始聊天'
              }
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <PetAvatar
                uri={item.otherUser.avatar_url}
                petStyle={item.otherUser.pet_style}
                size={52}
              />
              <View style={styles.rowText}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.otherUser.anonymous_name}</Text>
                  {!item.iceBroken && (
                    <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                      <Text style={styles.badgeText}>派对中</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.lastMessage ?? '开始聊天吧'}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  emptyList: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    padding: 16,
    textAlign: 'center',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  rowText: {
    flex: 1,
    marginLeft: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  preview: {
    fontSize: 14,
    marginTop: 4,
  },
});
