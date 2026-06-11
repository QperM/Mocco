import { create } from 'zustand';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { PetStyle } from '@/lib/types';
import { useAuthStore } from '@/stores/useAuthStore';

interface PetCreationState {
  selectedImages: string[];
  petStyle: PetStyle;
  isGenerating: boolean;
  addImage: (uri: string) => void;
  removeImage: (uri: string) => void;
  setPetStyle: (style: PetStyle) => void;
  clear: () => void;
  generateAvatar: () => Promise<string | null>;
}

export const usePetStore = create<PetCreationState>((set, get) => ({
  selectedImages: [],
  petStyle: 'cat',
  isGenerating: false,

  addImage: (uri) => {
    const current = get().selectedImages;
    if (current.length >= 3 || current.includes(uri)) return;
    set({ selectedImages: [...current, uri] });
  },

  removeImage: (uri) => {
    set({ selectedImages: get().selectedImages.filter((i) => i !== uri) });
  },

  setPetStyle: (style) => set({ petStyle: style }),

  clear: () => set({ selectedImages: [], petStyle: 'cat', isGenerating: false }),

  generateAvatar: async () => {
    const { selectedImages, petStyle } = get();
    if (!selectedImages.length) return null;

    set({ isGenerating: true });

    try {
      const authStore = useAuthStore.getState();

      // 本地模式：直接使用首图作为头像
      if (!isSupabaseConfigured || authStore.isLocalMode) {
        const avatarUrl = selectedImages[0];
        authStore.updateLocalProfile({ avatar_url: avatarUrl, pet_style: petStyle });
        set({ isGenerating: false });
        return avatarUrl;
      }

      const supabase = getSupabase();
      const userId = authStore.userId!;
      const uploadPaths: string[] = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const uri = selectedImages[i];
        const path = `${userId}/${Date.now()}_${i}.jpg`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { error } = await supabase.storage
          .from('pet-uploads')
          .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

        if (error) throw error;
        uploadPaths.push(path);

        await supabase.from('pet_uploads').insert({
          user_id: userId,
          storage_path: path,
          sort_order: i,
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('generate-pet', {
        body: { upload_paths: uploadPaths, pet_style: petStyle },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) throw res.error;

      await authStore.refreshProfile();
      set({ isGenerating: false });
      return res.data.avatar_url as string;
    } catch (err) {
      set({ isGenerating: false });
      throw err;
    }
  },
}));
