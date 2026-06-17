import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import PublishTabButton from '@/components/PublishTabButton';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 6,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '小窝',
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="square"
        options={{
          title: '萌壳圈',
          tabBarIcon: () => <TabIcon emoji="🍩" />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '',
          tabBarLabel: () => null,
          headerShown: false,
          tabBarButton: () => <PublishTabButton />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="party"
        options={{
          title: '派对',
          tabBarIcon: () => <TabIcon emoji="🎉" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '消息',
          tabBarIcon: () => <TabIcon emoji="💬" />,
        }}
      />
    </Tabs>
  );
}
