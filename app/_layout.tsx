import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AgriProvider } from '@/context/agri-context';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AgriProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AgriProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
