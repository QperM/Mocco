import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import PetAvatar from '@/components/PetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  liked?: boolean;
  onLike?: () => void;
}

function PostImages({ images }: { images: string[] }) {
  if (!images.length) return null;

  const cols = images.length === 1 ? 1 : images.length === 2 || images.length === 4 ? 2 : 3;

  return (
    <View style={styles.imageGrid}>
      {images.map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={[
            styles.postImage,
            cols === 1 ? styles.postImageSingle : styles.postImageMulti,
            cols === 2 ? styles.postImageHalf : null,
            cols === 3 ? styles.postImageThird : null,
          ]}
          resizeMode="cover"
        />
      ))}
    </View>
  );
}

export default function PostCard({ post, liked = false, onLike }: PostCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const images = post.images ?? [];

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
            {post.profiles?.anonymous_name ?? '匿名萌壳'}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {new Date(post.created_at).toLocaleDateString('zh-CN')}
          </Text>
        </View>
      </View>
      {post.content ? (
        <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
      ) : null}
      <PostImages images={images} />
      <Pressable onPress={onLike} disabled={!onLike} style={styles.footer}>
        <Text style={[styles.like, { color: liked ? colors.tint : colors.textSecondary }]}>
          {liked ? '❤️' : '🤍'} {post.likes_count}
        </Text>
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  postImage: {
    borderRadius: 10,
    backgroundColor: '#f0ebe3',
  },
  postImageSingle: {
    width: '100%',
    height: 220,
  },
  postImageMulti: {
    height: 108,
  },
  postImageHalf: {
    width: '48.5%',
  },
  postImageThird: {
    width: '31.5%',
  },
  footer: {
    marginTop: 12,
  },
  like: {
    fontSize: 14,
    fontWeight: '500',
  },
});
