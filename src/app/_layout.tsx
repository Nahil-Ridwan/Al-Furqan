import { Stack } from 'expo-router';
import { View } from 'react-native';
import { colors } from '../styles/global';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='student' options={{ presentation: 'card', title: 'Student Detail'}} />
    </Stack>
  </View>
  );
}