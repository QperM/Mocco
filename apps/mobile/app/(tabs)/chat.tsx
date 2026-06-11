import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import LocalModeBanner from '@/components/LocalModeBanner';
import PetAvatar from '@/components/PetAvatar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const MOCK_CHATS = [
  {
    id: '1',
    name: '神秘#4521',
    lastMessage: '要不要来一局猜拳？',
    petStyle: 'fox' as const,
    iceBroken: false,
  },
  {
    id: '2',
    name: '治愈#8834',
    lastMessage: '哈哈哈你好好玩',
    petStyle: 'hamster' as const,
    iceBroken: true,
  },
];

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocalModeBanner />
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={MOCK_CHATS.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <EmptyState emoji="💬" title="还没有聊天" subtitle="在广场认识新朋友，或通过破冰游戏开始对话" />
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <PetAvatar petStyle={item.petStyle} size={52} />
            <View style={styles.rowText}>
              <View style={styles.rowHeader}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                {!item.iceBroken && (
                  <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.badgeText}>未破冰</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  emptyList: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  rowText: {
    flex: 1,
    marginLeft: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  preview: {
    fontSize: 14,
    marginTop: 4,
  },
});
