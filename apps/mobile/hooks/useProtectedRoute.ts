import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useAuthStore } from '@/stores/useAuthStore';
import { isSupabaseConfigured } from '@/lib/supabase';

export function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLocalMode = useAuthStore((s) => s.isLocalMode);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const canEnterApp = isAuthenticated || (isLocalMode && !isSupabaseConfigured);

    if (!canEnterApp && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (canEnterApp && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isInitialized, isAuthenticated, isLocalMode, segments, router]);
}
