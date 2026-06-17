import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useCreatePost } from '@/hooks/usePosts';
import { MAX_POST_IMAGES } from '@/lib/constants/posts';
import { useAuthStore } from '@/stores/useAuthStore';

export default function PublishPostScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const isLocalMode = useAuthStore((s) => s.isLocalMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const createPost = useCreatePost();

  const pickImages = async () => {
    const remaining = MAX_POST_IMAGES - selectedImages.length;
    if (remaining <= 0) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要相册权限', '请在设置中允许访问相册');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => {
        const next = [...prev];
        for (const asset of result.assets) {
          if (next.length >= MAX_POST_IMAGES) break;
          if (!next.includes(asset.uri)) next.push(asset.uri);
        }
        return next;
      });
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((item) => item !== uri));
  };

  const publish = async () => {
    const text = content.trim();
    if (!text && selectedImages.length === 0) {
      Alert.alert('提示', '写点文字或添加图片再发布吧');
      return;
    }

    if (!isAuthenticated || isLocalMode) {
      Alert.alert('请先登录', '登录后即可发布到萌壳圈');
      return;
    }

    try {
      await createPost.mutateAsync({ content: text, imageUris: selectedImages });
      router.back();
    } catch (err) {
      Alert.alert('发布失败', err instanceof Error ? err.message : '请稍后重试');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: '发布到萌壳圈' }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder="分享萌宠的日常、心情或趣事…"
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={280}
            autoFocus
          />
          <Text style={[styles.count, { color: colors.textSecondary }]}>{content.length}/280</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            图片（最多 {MAX_POST_IMAGES} 张）
          </Text>
          <View style={styles.imageGrid}>
            {selectedImages.map((uri) => (
              <Pressable key={uri} onLongPress={() => removeImage(uri)} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.image} />
              </Pressable>
            ))}
            {selectedImages.length < MAX_POST_IMAGES && (
              <Pressable
                onPress={pickImages}
                style={[styles.addBtn, { borderColor: colors.tint, backgroundColor: colors.card }]}
              >
                <Text style={[styles.addBtnText, { color: colors.tint }]}>+</Text>
              </Pressable>
            )}
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            已选 {selectedImages.length}/{MAX_POST_IMAGES}，长按图片可删除
          </Text>

          <Pressable
            onPress={publish}
            disabled={createPost.isPending}
            style={[styles.btn, { backgroundColor: colors.tint, opacity: createPost.isPending ? 0.7 : 1 }]}
          >
            {createPost.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>发布到萌壳圈</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  input: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  count: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  addBtn: {
    width: 96,
    height: 96,
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
    marginBottom: 24,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
