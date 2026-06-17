import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateLocalPetName } from '@/lib/anonymous-name';
import { formatAuthError } from '@/lib/auth-errors';
import { DEFAULT_PUBLIC_PROFILE } from '@/lib/default-pet';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { appStorage, storageGetItem, storageSetItem } from '@/lib/storage';
import type { PetStyle, Profile } from '@/lib/types';

interface LocalProfile {
  anonymous_name: string;
  avatar_url: string | null;
  pet_style: PetStyle;
  bio: string;
}

interface AuthState {
  userId: string | null;
  email: string | null;
  profile: Profile | LocalProfile;
  isSyncing: boolean;
  isInitialized: boolean;
  isLocalMode: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateLocalProfile: (updates: Partial<LocalProfile>) => void;
  updateProfile: (updates: Partial<LocalProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const LOCAL_PROFILE_KEY = 'mocco-local-profile';
const SYNC_TIMEOUT_MS = 15000;

let authListenerRegistered = false;

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('sync timeout')), ms);
    }),
  ]);
}

async function loadLocalProfile(): Promise<LocalProfile> {
  try {
    const raw = await storageGetItem(LOCAL_PROFILE_KEY);
    if (raw) return JSON.parse(raw) as LocalProfile;
  } catch {
    // storage 不可用时回退默认资料
  }
  return {
    ...DEFAULT_PUBLIC_PROFILE,
    anonymous_name: generateLocalPetName(),
  };
}

function isEmailUser(user: { email?: string | null; is_anonymous?: boolean }) {
  return Boolean(user.email) && !user.is_anonymous;
}

function clearAuthState(): Partial<AuthState> {
  return {
    userId: null,
    email: null,
    isAuthenticated: false,
    isLocalMode: false,
    profile: DEFAULT_PUBLIC_PROFILE,
  };
}

function loggedInPatch(userId: string, email: string | null | undefined): Partial<AuthState> {
  return {
    userId,
    email: email ?? null,
    isLocalMode: false,
    isAuthenticated: true,
  };
}

async function ensureProfileRow(userId: string): Promise<void> {
  const supabase = getSupabase();
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (data) return;

  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  await supabase.from('profiles').insert({
    id: userId,
    anonymous_name: `萌壳#${suffix}`,
    pet_style: 'cat',
  });
}

function registerAuthListener(
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
) {
  if (authListenerRegistered) return;
  authListenerRegistered = true;

  getSupabase().auth.onAuthStateChange((_event, session) => {
    if (session?.user && isEmailUser(session.user)) {
      set(loggedInPatch(session.user.id, session.user.email));
      get().refreshProfile().catch(() => {});
    } else if (!get().isLocalMode) {
      set(clearAuthState());
    }
  });
}

async function applySessionFromSupabase(
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
) {
  const supabase = getSupabase();
  const { data: { session } } = await withTimeout(supabase.auth.getSession(), SYNC_TIMEOUT_MS);

  if (!session?.user || !isEmailUser(session.user)) {
    if (session?.user && !isEmailUser(session.user)) {
      await supabase.auth.signOut();
    }
    set(clearAuthState());
    return;
  }

  set(loggedInPatch(session.user.id, session.user.email));
  await get().refreshProfile();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      email: null,
      profile: DEFAULT_PUBLIC_PROFILE,
      isSyncing: false,
      isInitialized: false,
      isLocalMode: !isSupabaseConfigured,
      isAuthenticated: false,

      initialize: async () => {
        if (get().isInitialized && !get().isSyncing) return;

        set({ isSyncing: true });

        try {
          if (!isSupabaseConfigured) {
            const profile = await loadLocalProfile();
            set({
              isLocalMode: true,
              isAuthenticated: false,
              profile,
              userId: 'local',
              email: null,
              isInitialized: true,
            });
            return;
          }

          registerAuthListener(set, get);
          await applySessionFromSupabase(set, get);
        } catch {
          if (!isSupabaseConfigured) {
            const profile = await loadLocalProfile();
            set({
              isLocalMode: true,
              isAuthenticated: false,
              profile,
              userId: 'local',
              email: null,
            });
          } else {
            set(clearAuthState());
          }
        } finally {
          set({ isSyncing: false, isInitialized: true });
        }
      },

      signInWithEmail: async (email, password) => {
        if (!isSupabaseConfigured) throw new Error('Supabase 未配置');

        set({ isSyncing: true });
        try {
          const supabase = getSupabase();
          const { data, error } = await withTimeout(
            supabase.auth.signInWithPassword({ email: email.trim(), password }),
            SYNC_TIMEOUT_MS,
          );
          if (error) throw new Error(formatAuthError(error));
          if (!data.user) throw new Error('登录失败');

          set(loggedInPatch(data.user.id, data.user.email));
          try {
            await ensureProfileRow(data.user.id);
            await get().refreshProfile();
          } catch {
            // 资料同步失败不阻断登录
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      signUpWithEmail: async (email, password) => {
        if (!isSupabaseConfigured) throw new Error('Supabase 未配置');

        set({ isSyncing: true });
        try {
          const supabase = getSupabase();
          const { data, error } = await withTimeout(
            supabase.auth.signUp({ email: email.trim(), password }),
            SYNC_TIMEOUT_MS,
          );
          if (error) throw new Error(formatAuthError(error));

          if (data.session?.user) {
            set(loggedInPatch(data.session.user.id, data.session.user.email));
            try {
              await ensureProfileRow(data.session.user.id);
              await get().refreshProfile();
            } catch {
              // 资料同步失败不阻断注册
            }
            return;
          }

          throw new Error('注册成功！请查收验证邮件，确认后再登录');
        } finally {
          set({ isSyncing: false });
        }
      },

      signOut: async () => {
        set({ isSyncing: true });
        try {
          if (isSupabaseConfigured) {
            await getSupabase().auth.signOut();
          }
        } finally {
          set({
            ...clearAuthState(),
            isLocalMode: !isSupabaseConfigured,
            isSyncing: false,
          });
        }
      },

      updateLocalProfile: (updates) => {
        const current = get().profile as LocalProfile;
        const next = { ...current, ...updates };
        storageSetItem(LOCAL_PROFILE_KEY, JSON.stringify(next)).catch(() => {});
        set({ profile: next, isLocalMode: true, userId: get().userId ?? 'local' });
      },

      updateProfile: async (updates: Partial<LocalProfile>) => {
        const userId = get().userId;
        if (!userId || get().isLocalMode || !isSupabaseConfigured) {
          get().updateLocalProfile(updates);
          return;
        }

        const { error } = await getSupabase()
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;
        await get().refreshProfile();
      },

      refreshProfile: async () => {
        const userId = get().userId;
        if (!userId || userId === 'local' || get().isLocalMode) return;

        try {
          await ensureProfileRow(userId);
          const { data, error } = await withTimeout(
            getSupabase().from('profiles').select('*').eq('id', userId).single(),
            SYNC_TIMEOUT_MS,
          );

          if (error || !data) return;
          set({ profile: data as Profile });
        } catch {
          // 保留已有 profile
        }
      },
    }),
    {
      name: 'mocco-auth',
      storage: createJSONStorage(() => appStorage),
      partialize: () => ({}),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = false;
          state.userId = null;
          state.email = null;
        }
      },
    },
  ),
);
