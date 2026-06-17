import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import LocalModeBanner from '@/components/LocalModeBanner';
import PostCard from '@/components/PostCard';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { usePosts, useToggleLike } from '@/hooks/usePosts';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

const MOCK_POSTS = [
  {
    id: 'mock-1',
    user_id: 'a',
    content: '今天阳光好好，带毛球出去晒晒太阳～',
    images: [] as string[],
    likes_count: 12,
    created_at: new Date().toISOString(),
    profiles: { anonymous_name: '软萌#2847', avatar_url: null, pet_style: 'cat' as const },
    liked_by_me: false,
  },
];

export default function SquareScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLocalMode = useAuthStore((s) => s.isLocalMode);
  const { data: posts, isLoading, isRefetching, refetch, error } = usePosts();
  const toggleLike = useToggleLike();

  const showMock = !isSupabaseConfigured || isLocalMode;
  const listData = showMock ? MOCK_POSTS : (posts ?? []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocalModeBanner />

      {error && !showMock ? (
        <View style={styles.errorWrap}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            加载失败：{error.message}
          </Text>
        </View>
      ) : null}

      {isLoading && !showMock ? (
        <ActivityIndicator style={styles.loader} color={colors.tint} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listData.length ? styles.list : styles.emptyList}
          refreshControl={
            !showMock ? (
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.tint} />
            ) : undefined
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              liked={item.liked_by_me}
              onLike={
                showMock
                  ? undefined
                  : () => toggleLike.mutate({ postId: item.id, liked: Boolean(item.liked_by_me) })
              }
            />
          )}
          ListEmptyComponent={
            !showMock ? (
              <EmptyState emoji="🍩" title="萌壳圈还没有动态" subtitle="点底部发布按钮，分享第一条萌壳日常吧" />
            ) : null
          }
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  loader: {
    marginTop: 40,
  },
  errorWrap: {
    padding: 16,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
