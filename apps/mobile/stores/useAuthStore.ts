import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateLocalPetName } from '@/lib/anonymous-name';
import { DEFAULT_PUBLIC_PROFILE } from '@/lib/default-pet';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { PetStyle, Profile } from '@/lib/types';

interface LocalProfile {
  anonymous_name: string;
  avatar_url: string | null;
  pet_style: PetStyle;
  bio: string;
}

interface AuthState {
  userId: string | null;
  profile: Profile | LocalProfile;
  isSyncing: boolean;
  isLocalMode: boolean;
  initialize: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  updateLocalProfile: (updates: Partial<LocalProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const LOCAL_PROFILE_KEY = 'mocco-local-profile';
const SYNC_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('sync timeout')), ms);
    }),
  ]);
}

async function loadLocalProfile(): Promise<LocalProfile> {
  const raw = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
  if (raw) return JSON.parse(raw) as LocalProfile;
  return {
    ...DEFAULT_PUBLIC_PROFILE,
    anonymous_name: generateLocalPetName(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      profile: DEFAULT_PUBLIC_PROFILE,
      isSyncing: false,
      isLocalMode: !isSupabaseConfigured,

      initialize: async () => {
        if (get().isSyncing) return;
        set({ isSyncing: true });

        try {
          if (!isSupabaseConfigured) {
            const profile = await loadLocalProfile();
            set({ isLocalMode: true, profile, userId: 'local' });
            return;
          }

          const supabase = getSupabase();
          const { data: { session } } = await withTimeout(supabase.auth.getSession(), SYNC_TIMEOUT_MS);

          if (!session) {
            await get().signInAnonymously();
            return;
          }

          set({ userId: session.user.id, isLocalMode: false });
          await get().refreshProfile();
        } catch {
          const profile = await loadLocalProfile();
          set({ isLocalMode: true, profile, userId: 'local' });
        } finally {
          set({ isSyncing: false });
        }
      },

      signInAnonymously: async () => {
        if (!isSupabaseConfigured) return;

        try {
          const supabase = getSupabase();
          const { data, error } = await withTimeout(supabase.auth.signInAnonymously(), SYNC_TIMEOUT_MS);
          if (error) throw error;

          set({ userId: data.user!.id, isLocalMode: false });
          await get().refreshProfile();
        } catch {
          const profile = await loadLocalProfile();
          set({ isLocalMode: true, profile, userId: 'local' });
        }
      },

      updateLocalProfile: (updates) => {
        const current = get().profile as LocalProfile;
        const next = { ...current, ...updates };
        AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
        set({ profile: next, isLocalMode: true, userId: get().userId ?? 'local' });
      },

      refreshProfile: async () => {
        const userId = get().userId;
        if (!userId || get().isLocalMode) return;

        try {
          const supabase = getSupabase();
          const { data, error } = await withTimeout(
            supabase.from('profiles').select('*').eq('id', userId).single(),
            SYNC_TIMEOUT_MS,
          );

          if (error || !data) {
            const profile = await loadLocalProfile();
            set({ profile, isLocalMode: true });
            return;
          }

          set({ profile: data as Profile });
        } catch {
          const profile = await loadLocalProfile();
          set({ profile, isLocalMode: true });
        }
      },
    }),
    {
      name: 'mocco-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        isLocalMode: state.isLocalMode,
        profile: state.profile,
      }),
    },
  ),
);
