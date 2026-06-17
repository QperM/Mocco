import { getSupabase } from '@/lib/supabase';
import { uriToUploadPayload } from '@/lib/upload-image';

export async function uploadImageToBucket(
  bucket: string,
  path: string,
  uri: string,
): Promise<string> {
  const supabase = getSupabase();
  const { body, contentType } = await uriToUploadPayload(uri);

  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert: true,
  });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
