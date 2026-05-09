import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useBrandTint } from '@/constants/Colors';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const tint = useBrandTint();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-charcoal-900">
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.emailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="boot" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="band/[bandId]" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
