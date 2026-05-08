import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { auth } from '@/firebase';
import { useBandStore } from '@/store/bandStore';
import { getInvitesForEmail } from '@/services/inviteService';

export default function BootScreen() {
  const bandStore = useBandStore();

  useEffect(() => {
    let cancelled = false;

    async function routeToInitialScreen() {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        await bandStore.refreshUserBands();
        await bandStore.loadUserProfile();

        const state = useBandStore.getState();
        const pendingInvites = await getInvitesForEmail(user.email || '');
        if (cancelled) return;

        if (state.userBands.length === 0 || pendingInvites.length > 0) {
          router.replace('/(app)/dashboard');
          return;
        }

        const lastViewedBand = state.userBands.find((band) => band.id === state.lastViewedBandId);
        const targetBandId = lastViewedBand?.id || state.userBands[0]?.id;

        if (targetBandId) {
          router.replace(`/(app)/band/${targetBandId}/shows` as any);
        } else {
          router.replace('/(app)/dashboard');
        }
      } catch {
        if (!cancelled) {
          router.replace('/(app)/dashboard');
        }
      }
    }

    routeToInitialScreen();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-3 text-sm text-gray-500 dark:text-stone-400">Opening Bandit...</Text>
    </View>
  );
}
