import React, { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import * as Network from 'expo-network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;

    async function checkNetwork() {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) {
          setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
        }
      } catch {
        if (mounted) setIsOnline(true);
      }
    }

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkNetwork();
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  if (isOnline) return null;

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="absolute left-0 right-0 top-0 z-50 flex-row items-center justify-center gap-2 bg-amber-500 px-4 pb-2"
    >
      <FontAwesome name="wifi" size={14} color="#78350f" />
      <Text className="text-center text-sm font-medium text-amber-950">
        You're offline. Some features may be unavailable.
      </Text>
    </View>
  );
}
