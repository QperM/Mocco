import { getSupabase } from '@/lib/supabase';
import type { ConversationPreview, DbConversation, DbMessage } from '@/lib/database.types';
import { normalizeProfileJoin } from '@/lib/database.types';
import type { PetStyle } from '@/lib/types';

function pickOtherProfile(
  conv: DbConversation,
  profileA: { anonymous_name: string; avatar_url: string | null; pet_style: PetStyle } | null,
  profileB: { anonymous_name: string; avatar_url: string | null; pet_style: PetStyle } | null,
  currentUserId: string,
): ConversationPreview['otherUser'] {
  const other =
    conv.user_a === currentUserId
      ? profileB
      : profileA;
  return {
    anonymous_name: other?.anonymous_name ?? '匿名萌壳',
    avatar_url: other?.avatar_url ?? null,
    pet_style: (other?.pet_style ?? 'cat') as PetStyle,
  };
}

export async function fetchConversations(userId: string): Promise<ConversationPreview[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      user_a,
      user_b,
      ice_broken,
      last_message,
      last_message_at,
      created_at,
      profile_a:profiles!user_a (
        anonymous_name,
        avatar_url,
        pet_style
      ),
      profile_b:profiles!user_b (
        anonymous_name,
        avatar_url,
        pet_style
      )
    `)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;

  return (data ?? []).map((raw) => {
    const row = raw as DbConversation & {
      profile_a: ConversationPreview['otherUser'] | ConversationPreview['otherUser'][] | null;
      profile_b: ConversationPreview['otherUser'] | ConversationPreview['otherUser'][] | null;
    };
    const conv: DbConversation = row;
    return {
      id: conv.id,
      otherUser: pickOtherProfile(
        conv,
        normalizeProfileJoin(row.profile_a),
        normalizeProfileJoin(row.profile_b),
        userId,
      ),
      lastMessage: conv.last_message,
      lastMessageAt: conv.last_message_at,
      iceBroken: conv.ice_broken,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<DbMessage[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      profiles!sender_id (
        anonymous_name,
        avatar_url,
        pet_style
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((raw) => {
    const row = raw as unknown as DbMessage;
    return { ...row, profiles: normalizeProfileJoin(row.profiles as never) };
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<DbMessage> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      profiles!sender_id (
        anonymous_name,
        avatar_url,
        pet_style
      )
    `)
    .single();

  if (error) throw error;
  const row = data as unknown as DbMessage;
  return { ...row, profiles: normalizeProfileJoin(row.profiles as never) };
}

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
): Promise<string> {
  const supabase = getSupabase();
  const [userA, userB] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_a', userA)
    .eq('user_b', userB)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_a: userA, user_b: userB })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export function subscribeToMessages(
  conversationId: string,
  onInsert: (message: DbMessage) => void,
) {
  const supabase = getSupabase();

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const msg = payload.new as DbMessage;
        const { data } = await supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            content,
            created_at,
            profiles!sender_id (
              anonymous_name,
              avatar_url,
              pet_style
            )
          `)
          .eq('id', msg.id)
          .single();
        if (data) {
          const row = data as unknown as DbMessage;
          onInsert({ ...row, profiles: normalizeProfileJoin(row.profiles as never) });
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
