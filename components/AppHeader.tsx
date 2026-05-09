import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NavDrawer from './NavDrawer';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from './useColorScheme';

interface AppHeaderProps {
  bandId?: string;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ bandId, rightElement }: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const colorScheme = useColorScheme();
  const menuIconColor = colorScheme === 'dark' ? '#d1d0ce' : '#374151';

  return (
    <>
      <View className="bg-white dark:bg-charcoal-900 border-b border-gray-100 dark:border-charcoal-800">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="font-bitcount text-2xl text-bandit-primary dark:text-bandit-primarySoft uppercase tracking-widest">
            Bandit
          </Text>
          <View className="flex-row items-center gap-3">
            {rightElement}
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              className="p-2 rounded-lg bg-gray-50 dark:bg-charcoal-800"
              accessibilityLabel="Open menu"
            >
              <FontAwesome name="bars" size={20} color={menuIconColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} bandId={bandId} />
    </>
  );
}
