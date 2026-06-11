import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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
import { synthesizePetText } from '@/lib/pet-voice';
import type { PetStyle } from '@/lib/types';
import { useAuthStore } from '@/stores/useAuthStore';

interface ChatMessage {
  id: string;
  content: string;
  petTranslation: string;
  petStyle: PetStyle;
  isMine: boolean;
}

function createMessage(
  id: string,
  content: string,
  petStyle: PetStyle,
  isMine: boolean,
): ChatMessage {
  return {
    id,
    content,
    petStyle,
    isMine,
    petTranslation: synthesizePetText(content, petStyle, id),
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  createMessage('1', '嗨～你的萌宠皮套好可爱！', 'fox', false),
  createMessage('2', '谢谢！要不要来一局猜拳破冰？', 'cat', true),
  createMessage('3', '好呀！输了的人讲一个冷笑话 😄', 'dog', false),
];

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { profile } = useAuthStore();
  const myPetStyle = (profile?.pet_style ?? 'cat') as PetStyle;

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const listHeader = useMemo(
    () => (
      <View style={[styles.hintBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          🐾 宠语模式：消息已翻译为猫语/狗语文字。点击气泡播放拟真叫声，长按查看原文。
        </Text>
      </View>
    ),
    [colors],
  );

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const msgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      createMessage(msgId, text, myPetStyle, true),
    ]);
    setInput('');
  };

  return (
    <>
      <Stack.Screen options={{ title: `聊天 #${id}` }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <PetVoiceBubble
              originalText={item.content}
              petTranslation={item.petTranslation}
              petStyle={item.petStyle}
              isMine={item.isMine}
            />
          )}
        />
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="输入人话，发送后自动翻译成宠语…"
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
          />
          <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: colors.tint }]}>
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
