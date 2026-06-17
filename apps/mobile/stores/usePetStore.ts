import { create } from 'zustand';

import { uploadImageToBucket } from '@/lib/api/storage';
import { saveAvatarFromUpload } from '@/lib/api/profiles';
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

        await uploadImageToBucket('pet-uploads', path, uri);
        uploadPaths.push(path);

        await supabase.from('pet_uploads').insert({
          user_id: userId,
          storage_path: path,
          sort_order: i,
        });
      }

      let avatarUrl: string | null = null;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await supabase.functions.invoke('generate-pet', {
          body: { upload_paths: uploadPaths, pet_style: petStyle },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (!res.error && res.data?.avatar_url) {
          avatarUrl = res.data.avatar_url as string;
        }
      } catch {
        // Edge Function 未部署时使用客户端 fallback
      }

      if (!avatarUrl) {
        avatarUrl = await saveAvatarFromUpload(userId, uploadPaths[0], petStyle);
      }

      await authStore.refreshProfile();
      set({ isGenerating: false });
      return avatarUrl;
    } catch (err) {
      set({ isGenerating: false });
      throw err;
    }
  },
}));
