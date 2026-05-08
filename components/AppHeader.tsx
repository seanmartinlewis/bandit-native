import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavDrawer from './NavDrawer';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface AppHeaderProps {
  bandId?: string;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ bandId, rightElement }: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-2xl font-bold text-blue-600 dark:text-slate-400 uppercase tracking-widest">
            Bandit
          </Text>
          <View className="flex-row items-center gap-3">
            {rightElement}
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
              accessibilityLabel="Open menu"
            >
              <FontAwesome name="bars" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} bandId={bandId} />
    </>
  );
}
