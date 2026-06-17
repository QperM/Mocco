import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" options={{ headerShown: true, title: '登录' }} />
      <Stack.Screen name="register" options={{ headerShown: true, title: '注册' }} />
    </Stack>
  );
}
