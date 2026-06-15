import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

/** Web 用 localStorage，原生用 AsyncStorage */
const webStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // ignore quota / private mode
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

let nativeStorage: StateStorage | null = null;

function getNativeStorage(): StateStorage {
  if (!nativeStorage) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    nativeStorage = {
      getItem: (name) => AsyncStorage.getItem(name),
      setItem: (name, value) => AsyncStorage.setItem(name, value),
      removeItem: (name) => AsyncStorage.removeItem(name),
    };
  }
  return nativeStorage;
}

export const appStorage: StateStorage =
  Platform.OS === 'web' ? webStorage : getNativeStorage();

/** Supabase Auth 兼容的异步 storage */
export const supabaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const value = await appStorage.getItem(key);
    return value ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await appStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await appStorage.removeItem(key);
  },
};

export async function storageGetItem(key: string): Promise<string | null> {
  const value = await appStorage.getItem(key);
  return value ?? null;
}

export async function storageSetItem(key: string, value: string): Promise<void> {
  await appStorage.setItem(key, value);
}
