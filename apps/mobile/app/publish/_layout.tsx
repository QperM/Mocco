import { Stack } from 'expo-router';

export default function PublishLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerStyle: { backgroundColor: '#F5F0E8' },
      }}
    />
  );
}
