import { MAX_POST_IMAGES } from '@/lib/constants/posts';
import { uploadImageToBucket } from '@/lib/api/storage';
import { mapDbPost, type DbPost, type PostWithMeta } from '@/lib/database.types';
import { getSupabase } from '@/lib/supabase';

const POST_IMAGES_BUCKET = 'post-images';

async function uploadPostImages(userId: string, imageUris: string[]): Promise<string[]> {
  if (!imageUris.length) return [];

  const batchId = Date.now();
  const urls: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const path = `${userId}/${batchId}_${i}.jpg`;
    const publicUrl = await uploadImageToBucket(POST_IMAGES_BUCKET, path, imageUris[i]);
    urls.push(publicUrl);
  }

  return urls;
}

export async function fetchPosts(userId: string | null): Promise<PostWithMeta[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      content,
      images,
      likes_count,
      created_at,
      profiles!user_id (
        anonymous_name,
        avatar_url,
        pet_style
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  let likedSet = new Set<string>();
  if (userId) {
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);
    likedSet = new Set((likes ?? []).map((l) => l.post_id));
  }

  return ((data ?? []) as unknown as DbPost[]).map((row) => mapDbPost(row, likedSet.has(row.id)));
}

export interface CreatePostInput {
  content: string;
  imageUris?: string[];
}

export async function createPost(
  userId: string,
  { content, imageUris = [] }: CreatePostInput,
): Promise<PostWithMeta> {
  const supabase = getSupabase();
  const trimmed = content.trim();

  if (!trimmed && imageUris.length === 0) {
    throw new Error('请填写文字或添加图片');
  }
  if (imageUris.length > MAX_POST_IMAGES) {
    throw new Error(`最多上传 ${MAX_POST_IMAGES} 张图片`);
  }

  const imageUrls = await uploadPostImages(userId, imageUris);

  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, content: trimmed, images: imageUrls })
    .select(`
      id,
      user_id,
      content,
      images,
      likes_count,
      created_at,
      profiles!user_id (
        anonymous_name,
        avatar_url,
        pet_style
      )
    `)
    .single();

  if (error) throw error;
  const row = data as unknown as DbPost;
  return mapDbPost(row, false);
}

export async function togglePostLike(
  userId: string,
  postId: string,
  currentlyLiked: boolean,
): Promise<void> {
  const supabase = getSupabase();

  if (currentlyLiked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('post_likes').insert({
      post_id: postId,
      user_id: userId,
    });
    if (error) throw error;
  }
}
