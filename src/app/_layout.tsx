import { Stack } from 'expo-router';
import { View } from 'react-native';
import LockScreen from '../components/LockScreen';
import { AppModeProvider, useAppMode } from '../storage/appModeContext';
import { colors } from '../styles/global';

function RootContent() {
  const { mode } = useAppMode();

  if (mode === null) {
    return ( 
     <View style={{ flex: 1, backgroundColor: colors.background }}>
       <LockScreen />
     </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='student' options={{ presentation: 'card', title: 'Student Detail'}} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppModeProvider>
      <RootContent />
    </AppModeProvider>
  );
}