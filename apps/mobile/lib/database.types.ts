import type { PetStyle, Post, Profile } from '@/lib/types';

export interface DbProfile {
  id: string;
  anonymous_name: string;
  avatar_url: string | null;
  pet_style: PetStyle;
  bio: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbPost {
  id: string;
  user_id: string;
  content: string;
  images: string[] | null;
  likes_count: number;
  created_at: string;
  profiles: Pick<DbProfile, 'anonymous_name' | 'avatar_url' | 'pet_style'> | null;
}

export interface DbConversation {
  id: string;
  user_a: string;
  user_b: string;
  ice_broken: boolean;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<DbProfile, 'anonymous_name' | 'avatar_url' | 'pet_style'> | null;
}

export interface PostWithMeta extends Post {
  liked_by_me?: boolean;
}

export interface ConversationPreview {
  id: string;
  otherUser: Pick<Profile, 'anonymous_name' | 'avatar_url' | 'pet_style'>;
  lastMessage: string | null;
  lastMessageAt: string | null;
  iceBroken: boolean;
}

export function mapDbPost(row: DbPost, likedByMe = false): PostWithMeta {
  return {
    id: row.id,
    user_id: row.user_id,
    content: row.content,
    images: row.images ?? [],
    likes_count: row.likes_count,
    created_at: row.created_at,
    profiles: normalizeProfileJoin(row.profiles as ProfileJoin | ProfileJoin[] | null) ?? undefined,
    liked_by_me: likedByMe,
  };
}

type ProfileJoin = Pick<Profile, 'anonymous_name' | 'avatar_url' | 'pet_style'> | null;

/** Supabase join 可能返回对象或单元素数组 */
export function normalizeProfileJoin(
  value: ProfileJoin | ProfileJoin[] | null | undefined,
): ProfileJoin {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}
