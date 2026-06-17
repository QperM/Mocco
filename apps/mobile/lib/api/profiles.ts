import { getSupabase } from '@/lib/supabase';
import type { PetStyle } from '@/lib/types';

export async function updateProfile(
  userId: string,
  updates: {
    avatar_url?: string | null;
    pet_style?: PetStyle;
    bio?: string | null;
    anonymous_name?: string;
  },
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

/** Edge Function 不可用时的客户端 fallback：复制首图到 avatars */
export async function saveAvatarFromUpload(
  userId: string,
  uploadPath: string,
  petStyle: PetStyle,
): Promise<string> {
  const supabase = getSupabase();

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('pet-uploads')
    .download(uploadPath);

  if (downloadError || !fileData) throw downloadError ?? new Error('读取上传图片失败');

  const avatarPath = `${userId}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(avatarPath, fileData, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(avatarPath);

  await updateProfile(userId, { avatar_url: publicUrl, pet_style: petStyle });
  return publicUrl;
}
