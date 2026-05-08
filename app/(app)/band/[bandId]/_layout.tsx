import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { useBandStore } from '@/store/bandStore';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function BandLayout() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();

  useEffect(() => {
    if (!bandId) return;
    bandStore.loadBand(bandId);

    // Real-time listener for band changes
    const unsub = onSnapshot(doc(db, 'bands', bandId), async (snapshot) => {
      if (snapshot.exists()) {
        await bandStore.loadBand(bandId);
        if (!bandStore.currentRole) {
          router.replace('/(app)/dashboard');
        }
      } else {
        await bandStore.setLastViewedBandId(null);
        await bandStore.refreshUserBands();
        router.replace('/(app)/dashboard');
      }
    }, (error) => {
      if (error.code === 'permission-denied') {
        bandStore.setLastViewedBandId(null);
        bandStore.refreshUserBands();
        router.replace('/(app)/dashboard');
      }
    });

    return unsub;
  }, [bandId]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="shows" />
      <Stack.Screen name="show/[showId]" />
      <Stack.Screen name="members" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="band-profile" />
      <Stack.Screen name="invites" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="tours" />
      <Stack.Screen name="tour/[tourId]" />
    </Stack>
  );
}
