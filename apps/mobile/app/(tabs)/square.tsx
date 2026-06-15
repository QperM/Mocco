import { FlatList, StyleSheet, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import LocalModeBanner from '@/components/LocalModeBanner';
import PostCard from '@/components/PostCard';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Post } from '@/lib/types';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    user_id: 'a',
    content: '今天阳光好好，带毛球出去晒晒太阳～',
    images: [],
    likes_count: 12,
    created_at: new Date().toISOString(),
    profiles: { anonymous_name: '软萌#2847', avatar_url: null, pet_style: 'cat' },
  },
  {
    id: '2',
    user_id: 'b',
    content: '有没有人想玩猜拳破冰？输了请对方喝虚拟奶茶 🧋',
    images: [],
    likes_count: 8,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: { anonymous_name: '团子#1092', avatar_url: null, pet_style: 'rabbit' },
  },
  {
    id: '3',
    user_id: 'c',
    content: '刚生成了新皮套！大家觉得怎么样？',
    images: [],
    likes_count: 24,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: { anonymous_name: '元气#7731', avatar_url: null, pet_style: 'dog' },
  },
];

export default function SquareScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocalModeBanner />
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <EmptyState emoji="🍩" title="萌壳圈还没有动态" subtitle="成为第一个分享日常的人吧" />
        }
      />
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
});
