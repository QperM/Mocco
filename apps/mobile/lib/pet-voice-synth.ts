/**
 * 程序化合成拟真猫叫 / 狗叫
 * Web：AudioContext（不依赖原生模块）
 * 原生：按需加载 expo-av
 */

import { Platform } from 'react-native';

const SAMPLE_RATE = 22050;

type ExpoSound = {
  stopAsync(): Promise<void>;
  unloadAsync(): Promise<void>;
  setOnPlaybackStatusUpdate(
    callback: (status: { isLoaded?: boolean; didJustFinish?: boolean }) => void,
  ): void;
};

type ExpoAudioModule = {
  Audio: {
    setAudioModeAsync(options: Record<string, boolean>): Promise<void>;
    Sound: {
      createAsync(
        source: { uri: string },
        initialStatus?: { shouldPlay?: boolean; volume?: number },
      ): Promise<{ sound: ExpoSound }>;
    };
  };
};

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noiseSample(rng: () => number): number {
  return (rng() - 0.5) * 2;
}

export function synthesizeMeowSamples(variation = Math.random()): Float32Array {
  const rng = mulberry32(Math.floor(variation * 1e9));
  const duration = 0.22 + rng() * 0.28;
  const length = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(length);
  let phase = 0;
  let phase2 = 0;

  const startFreq = 520 + rng() * 380;
  const endFreq = 280 + rng() * 180;

  for (let i = 0; i < length; i++) {
    const progress = i / length;
    const t = i / SAMPLE_RATE;
    const freq = startFreq + (endFreq - startFreq) * Math.pow(progress, 0.7);
    const vibrato = 1 + Math.sin(t * 28) * 0.03 * (1 - progress);

    phase += (2 * Math.PI * freq * vibrato) / SAMPLE_RATE;
    phase2 += (2 * Math.PI * freq * 1.85 * vibrato) / SAMPLE_RATE;

    const attack = Math.min(1, progress * 18);
    const decay = Math.pow(1 - progress, 1.6);
    const env = attack * decay;

    const tone = Math.sin(phase) * 0.55 + Math.sin(phase2) * 0.18;
    const breath = noiseSample(rng) * 0.12 * env * (0.4 + progress);
    samples[i] = Math.max(-1, Math.min(1, (tone + breath) * env * 0.85));
  }

  return samples;
}

export function synthesizeBarkSamples(variation = Math.random()): Float32Array {
  const rng = mulberry32(Math.floor(variation * 1e9) + 7);
  const duration = 0.1 + rng() * 0.14;
  const length = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(length);
  let phase = 0;
  const baseFreq = 180 + rng() * 120;

  for (let i = 0; i < length; i++) {
    const progress = i / length;
    const t = i / SAMPLE_RATE;
    const freq = baseFreq * (1 - progress * 0.35);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;

    const attack = Math.min(1, progress * 40);
    const decay = Math.pow(1 - progress, 2.8);
    const env = attack * decay;

    const saw = ((phase / Math.PI) % 2) - 1;
    const sine = Math.sin(phase);
    const tone = sine * 0.45 + saw * 0.15;
    const noise = noiseSample(rng) * 0.35 * env;
    const pulse = 0.6 + 0.4 * Math.sin(t * 35) * Math.exp(-progress * 4);

    samples[i] = Math.max(-1, Math.min(1, (tone + noise) * env * pulse * 0.9));
  }

  return samples;
}

function toDataUri(samples: Float32Array): string {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    result += base64Chars[a >> 2];
    result += base64Chars[((a & 3) << 4) | (b >> 4)];
    result += i + 1 < bytes.length ? base64Chars[((b & 15) << 2) | (c >> 6)] : '=';
    result += i + 2 < bytes.length ? base64Chars[c & 63] : '=';
  }
  return `data:audio/wav;base64,${result}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let webCtx: AudioContext | null = null;

function getWebAudioContext(): AudioContext {
  if (!webCtx) {
    const Ctx =
      typeof window !== 'undefined'
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : null;
    if (!Ctx) throw new Error('Web Audio API 不可用');
    webCtx = new Ctx();
  }
  return webCtx;
}

async function playSamplesWeb(samples: Float32Array): Promise<void> {
  const ctx = getWebAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  const buffer = ctx.createBuffer(1, samples.length, SAMPLE_RATE);
  buffer.copyToChannel(new Float32Array(samples), 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  return new Promise((resolve) => {
    source.onended = () => resolve();
  });
}

let nativeSound: ExpoSound | null = null;
let expoAvModule: ExpoAudioModule | null = null;

async function getExpoAv(): Promise<ExpoAudioModule> {
  if (!expoAvModule) {
    expoAvModule = (await import('expo-av')) as unknown as ExpoAudioModule;
  }
  return expoAvModule;
}

async function playSamplesNative(samples: Float32Array): Promise<void> {
  const { Audio } = await getExpoAv();
  const uri = toDataUri(samples);

  if (nativeSound) {
    try {
      await nativeSound.unloadAsync();
    } catch {
      // ignore
    }
    nativeSound = null;
  }

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });

  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: 1 });
  nativeSound = sound;

  return new Promise((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) resolve();
    });
  });
}

async function playSamples(samples: Float32Array): Promise<void> {
  if (Platform.OS === 'web') {
    await playSamplesWeb(samples);
  } else {
    await playSamplesNative(samples);
  }
}

let playGeneration = 0;

export function stopPetVoice(): void {
  playGeneration++;
  if (nativeSound) {
    nativeSound.stopAsync().catch(() => {});
    nativeSound.unloadAsync().catch(() => {});
    nativeSound = null;
  }
}

export async function playPetVoiceSounds(isDog: boolean): Promise<void> {
  const generation = ++playGeneration;
  const burstCount = 2 + Math.floor(Math.random() * 4);

  for (let i = 0; i < burstCount; i++) {
    if (generation !== playGeneration) return;

    const variation = Math.random();
    const samples = isDog ? synthesizeBarkSamples(variation) : synthesizeMeowSamples(variation);
    await playSamples(samples);

    if (i < burstCount - 1 && generation === playGeneration) {
      await delay(60 + Math.random() * 180);
    }
  }
}
