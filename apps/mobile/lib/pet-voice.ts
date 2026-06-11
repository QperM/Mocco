import { playPetVoiceSounds, stopPetVoice } from '@/lib/pet-voice-synth';
import type { PetStyle } from '@/lib/types';

const CAT_SYLLABLES = ['喵', '喵喵', '喵呜', '咪', '咕噜', '喵嗷'];
const DOG_SYLLABLES = ['汪', '汪汪', '呜汪', '嗷呜', '汪呜', '嗷'];

const DOG_STYLES: PetStyle[] = ['dog', 'fox'];

export function isDogVoice(petStyle: PetStyle): boolean {
  return DOG_STYLES.includes(petStyle);
}

function createSeededRng(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return ((hash >>> 0) % 10000) / 10000;
  };
}

/** 根据原文长度和种子，合成稳定的「宠语」文字（同一条消息每次显示一致） */
export function synthesizePetText(
  originalText: string,
  petStyle: PetStyle,
  seed: string,
): string {
  const rng = createSeededRng(seed);
  const syllables = isDogVoice(petStyle) ? DOG_SYLLABLES : CAT_SYLLABLES;
  const count = Math.min(Math.max(Math.ceil(originalText.length / 2), 4), 18);
  return Array.from({ length: count }, () => syllables[Math.floor(rng() * syllables.length)]).join('');
}

/** 点击气泡时播放拟真合成的猫叫/狗叫（非 TTS） */
export function playPetVoice(petStyle: PetStyle): Promise<void> {
  stopPetVoice();
  return playPetVoiceSounds(isDogVoice(petStyle));
}

export function getPetVoiceLabel(petStyle: PetStyle): string {
  return isDogVoice(petStyle) ? '狗语' : '猫语';
}
