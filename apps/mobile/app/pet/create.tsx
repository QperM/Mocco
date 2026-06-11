import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PET_STYLE_EMOJI, PET_STYLE_LABEL, type PetStyle } from '@/lib/types';
import { usePetStore } from '@/stores/usePetStore';

const STYLES: PetStyle[] = ['cat', 'dog', 'rabbit', 'hamster', 'fox'];

export default function CreatePetScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { selectedImages, petStyle, isGenerating, addImage, removeImage, setPetStyle, generateAvatar, clear } =
    usePetStore();
  const [error, setError] = useState<string | null>(null);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - selectedImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      result.assets.forEach((asset) => addImage(asset.uri));
    }
  };

  const handleGenerate = async () => {
    if (!selectedImages.length) {
      Alert.alert('提示', '请至少选择一张照片');
      return;
    }

    setError(null);
    try {
      await generateAvatar();
      clear();
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: '创建萌宠头像', presentation: 'modal' }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>上传照片（1–3 张）</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          上传你的宠物照片，我们会生成 2D 萌宠皮套头像
        </Text>

        <View style={styles.imageGrid}>
          {selectedImages.map((uri) => (
            <Pressable key={uri} onLongPress={() => removeImage(uri)} style={styles.imageWrap}>
              <Image source={{ uri }} style={styles.image} />
            </Pressable>
          ))}
          {selectedImages.length < 3 && (
            <Pressable
              onPress={pickImages}
              style={[styles.addBtn, { borderColor: colors.tint, backgroundColor: colors.card }]}
            >
              <Text style={[styles.addBtnText, { color: colors.tint }]}>+</Text>
            </Pressable>
          )}
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>长按图片可删除</Text>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>选择萌宠风格</Text>
        <View style={styles.styleGrid}>
          {STYLES.map((style) => (
            <Pressable
              key={style}
              onPress={() => setPetStyle(style)}
              style={[
                styles.styleChip,
                {
                  backgroundColor: petStyle === style ? colors.tint : colors.card,
                  borderColor: petStyle === style ? colors.tint : colors.border,
                },
              ]}
            >
              <Text style={styles.styleEmoji}>{PET_STYLE_EMOJI[style]}</Text>
              <Text
                style={[
                  styles.styleLabel,
                  { color: petStyle === style ? '#fff' : colors.text },
                ]}
              >
                {PET_STYLE_LABEL[style]}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleGenerate}
          disabled={isGenerating}
          style={[styles.generateBtn, { backgroundColor: colors.tint, opacity: isGenerating ? 0.7 : 1 }]}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateBtnText}>生成萌宠头像</Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 32,
    fontWeight: '300',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  styleEmoji: {
    fontSize: 18,
  },
  styleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    color: '#E53935',
    marginTop: 16,
    textAlign: 'center',
  },
  generateBtn: {
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
