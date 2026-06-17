import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPost, fetchPosts, togglePostLike, type CreatePostInput } from '@/lib/api/posts';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export function usePosts() {
  const userId = useAuthStore((s) => s.userId);
  const isLocalMode = useAuthStore((s) => s.isLocalMode);

  return useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
    enabled: isSupabaseConfigured && !isLocalMode && Boolean(userId && userId !== 'local'),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useMutation({
    mutationFn: (input: CreatePostInput) => {
      if (!isAuthenticated || !userId || userId === 'local') throw new Error('请先登录');
      return createPost(userId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: ({
      postId,
      liked,
    }: {
      postId: string;
      liked: boolean;
    }) => {
      if (!userId || userId === 'local') throw new Error('请先登录');
      return togglePostLike(userId, postId, liked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
