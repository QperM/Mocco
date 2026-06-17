import { Platform } from 'react-native';

export interface UploadPayload {
  body: Blob | ArrayBuffer;
  contentType: string;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function guessContentType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

/** 将 ImagePicker 返回的 URI 转为 Supabase Storage 可上传的二进制 */
export async function uriToUploadPayload(uri: string): Promise<UploadPayload> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return { body: blob, contentType: blob.type || guessContentType(uri) };
  }

  const FileSystem = require('expo-file-system') as typeof import('expo-file-system');
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    body: base64ToArrayBuffer(base64),
    contentType: guessContentType(uri),
  };
}
