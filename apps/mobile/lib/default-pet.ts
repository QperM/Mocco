import type { PetStyle } from '@/lib/types';

export interface DefaultProfile {
  anonymous_name: string;
  avatar_url: string | null;
  pet_style: PetStyle;
  bio: string;
}

/** 所有新用户看到的公共 2D 萌壳占位 */
export const DEFAULT_PUBLIC_PROFILE: DefaultProfile = {
  anonymous_name: '萌萌',
  avatar_url: null,
  pet_style: 'cat',
  bio: '上传宠物照片，生成你的专属萌壳吧～',
};

export function hasCustomAvatar(avatarUrl: string | null | undefined): boolean {
  return Boolean(avatarUrl);
}
