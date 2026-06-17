import { useQuery } from '@tanstack/react-query';

import { fetchMessages } from '@/lib/api/conversations';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export function useMessages(conversationId: string) {
  const isLocalMode = useAuthStore((s) => s.isLocalMode);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: isSupabaseConfigured && !isLocalMode && Boolean(conversationId),
  });
}
