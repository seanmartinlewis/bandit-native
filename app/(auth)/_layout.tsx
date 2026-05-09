import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useBrandTint } from '@/constants/Colors';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const tint = useBrandTint();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-charcoal-900">
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  // If user is authenticated and email verified, redirect to app
  if (user && user.emailVerified) {
    return <Redirect href="/(app)/boot" />;
  }

  // If user is authenticated but email not verified, redirect to verify
  if (user && !user.emailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
