import { Pressable, StyleSheet, Text, View } from 'react-native';

import PetAvatar from '@/components/PetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <PetAvatar
          uri={post.profiles?.avatar_url}
          petStyle={post.profiles?.pet_style ?? 'cat'}
          size={44}
        />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]}>
            {post.profiles?.anonymous_name ?? '匿名萌宠'}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {new Date(post.created_at).toLocaleDateString('zh-CN')}
          </Text>
        </View>
      </View>
      <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
      <Pressable onPress={onLike} style={styles.footer}>
        <Text style={[styles.like, { color: colors.tint }]}>❤️ {post.likes_count}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    marginTop: 12,
  },
  like: {
    fontSize: 14,
    fontWeight: '500',
  },
});
