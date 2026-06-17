import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchConversations, sendMessage } from '@/lib/api/conversations';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export function useConversations() {
  const userId = useAuthStore((s) => s.userId);
  const isLocalMode = useAuthStore((s) => s.isLocalMode);

  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => fetchConversations(userId!),
    enabled: isSupabaseConfigured && !isLocalMode && Boolean(userId && userId !== 'local'),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (content: string) => {
      if (!userId || userId === 'local') throw new Error('请先登录');
      return sendMessage(conversationId, userId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
