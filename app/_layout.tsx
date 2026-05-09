import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  BitcountPropSingle_700Bold,
} from '@expo-google-fonts/bitcount-prop-single';
import {
  RedHatDisplay_400Regular,
  RedHatDisplay_500Medium,
  RedHatDisplay_600SemiBold,
  RedHatDisplay_700Bold,
} from '@expo-google-fonts/red-hat-display';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider } from '@/context/AuthContext';
import OfflineBanner from '@/components/OfflineBanner';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    BitcountPropSingle_700Bold,
    RedHatDisplay_400Regular,
    RedHatDisplay_500Medium,
    RedHatDisplay_600SemiBold,
    RedHatDisplay_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      const DefaultText = Text as typeof Text & { defaultProps?: { style?: unknown } };
      const DefaultTextInput = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
      DefaultText.defaultProps = DefaultText.defaultProps || {};
      DefaultText.defaultProps.style = [
        { fontFamily: 'RedHatDisplay_400Regular' },
        DefaultText.defaultProps.style,
      ];
      DefaultTextInput.defaultProps = DefaultTextInput.defaultProps || {};
      DefaultTextInput.defaultProps.style = [
        { fontFamily: 'RedHatDisplay_400Regular' },
        DefaultTextInput.defaultProps.style,
      ];
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}
