import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import PetVoiceBubble from '@/components/PetVoiceBubble';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { subscribeToMessages } from '@/lib/api/conversations';
import type { DbMessage } from '@/lib/database.types';
import { synthesizePetText } from '@/lib/pet-voice';
import type { PetStyle } from '@/lib/types';
import { useMessages } from '@/hooks/useMessages';
import { useSendMessage } from '@/hooks/useConversations';
import { useAuthStore } from '@/stores/useAuthStore';

interface ChatMessage {
  id: string;
  content: string;
  petTranslation: string;
  petStyle: PetStyle;
  isMine: boolean;
  createdAt: string;
}

function toChatMessage(row: DbMessage, myUserId: string): ChatMessage {
  const petStyle = (row.profiles?.pet_style ?? 'cat') as PetStyle;
  return {
    id: row.id,
    content: row.content,
    petStyle,
    isMine: row.sender_id === myUserId,
    createdAt: row.created_at,
    petTranslation: synthesizePetText(row.content, petStyle, row.id),
  };
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const userId = useAuthStore((s) => s.userId);
  const isLocalMode = useAuthStore((s) => s.isLocalMode);
  const myPetStyle = (useAuthStore((s) => s.profile?.pet_style) ?? 'cat') as PetStyle;

  const { data: rows, isLoading } = useMessages(id);
  const sendMutation = useSendMessage(id);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!id || isLocalMode || !userId) return;
    return subscribeToMessages(id, (msg) => {
      setLiveMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, toChatMessage(msg, userId)];
      });
    });
  }, [id, isLocalMode, userId]);

  const messages = useMemo(() => {
    if (isLocalMode || !userId) return [];
    const base = (rows ?? []).map((r) => toChatMessage(r, userId));
    const merged = [...base];
    for (const m of liveMessages) {
      if (!merged.some((x) => x.id === m.id)) merged.push(m);
    }
    return merged.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [rows, liveMessages, isLocalMode, userId]);

  const listHeader = useMemo(
    () => (
      <View style={[styles.hintBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          🐾 宠语模式：点击气泡播放叫声，长按查看原文
        </Text>
      </View>
    ),
    [colors],
  );

  const send = async () => {
    const text = input.trim();
    if (!text || isLocalMode || !userId) return;

    setInput('');
    try {
      const msg = await sendMutation.mutateAsync(text);
      setLiveMessages((prev) => [...prev, toChatMessage(msg, userId)]);
    } catch {
      setInput(text);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: '消息' }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={colors.tint} />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={listHeader}
            renderItem={({ item }) => (
              <PetVoiceBubble
                originalText={item.content}
                petTranslation={item.petTranslation}
                petStyle={item.isMine ? myPetStyle : item.petStyle}
                isMine={item.isMine}
              />
            )}
          />
        )}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={isLocalMode ? '配置 Supabase 后可发送消息' : '输入人话，发送后自动翻译成宠语…'}
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            editable={!isLocalMode}
          />
          <Pressable
            onPress={send}
            disabled={isLocalMode || sendMutation.isPending}
            style={[styles.sendBtn, { backgroundColor: colors.tint, opacity: isLocalMode ? 0.5 : 1 }]}
          >
            <Text style={styles.sendText}>发送</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  loader: {
    marginTop: 40,
  },
  hintBar: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
