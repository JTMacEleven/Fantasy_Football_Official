import { DarkTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { BrandColors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const AfroAngelTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: BrandColors.neonGreen,
    background: BrandColors.black,
    card: BrandColors.cardBg,
    border: BrandColors.border,
    text: '#FFFFFF',
  },
};

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const onLogin = segments[0] === 'login';

    if (!user && !onLogin) {
      router.replace('/login');
    } else if (user && onLogin) {
      router.replace('/');
    }
  }, [user, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BrandColors.black } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Orbitron_400Regular: require('@/assets/fonts/Orbitron-Regular.ttf'),
    Orbitron_500Medium: require('@/assets/fonts/Orbitron-Medium.ttf'),
    Orbitron_700Bold: require('@/assets/fonts/Orbitron-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BrandColors.black }}>
        <ActivityIndicator color={BrandColors.neonGreen} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider value={AfroAngelTheme}>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
