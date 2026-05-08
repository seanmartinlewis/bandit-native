import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useBandStore } from '@/store/bandStore';
import { deleteBand, updateBandProfile } from '@/services/bandService';

export default function SettingsScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const band = bandStore.currentBand;
  const [isActive, setIsActive] = useState(band?.status !== 'Inactive');
  const [savingStatus, setSavingStatus] = useState(false);

  async function handleToggleStatus(value: boolean) {
    setIsActive(value);
    setSavingStatus(true);
    try {
      await updateBandProfile(bandId!, { status: value ? 'Active' : 'Inactive' });
      await bandStore.loadBand(bandId!);
    } catch {
      Alert.alert('Error', 'Failed to update status');
      setIsActive(!value);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleDeleteBand() {
    Alert.alert(
      'Delete Band?',
      `Permanently delete "${band?.name}"? This cannot be undone and will remove all band data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently', style: 'destructive',
          onPress: async () => {
            try {
              await deleteBand(bandId!);
              await bandStore.setLastViewedBandId(null);
              await bandStore.refreshUserBands();
              bandStore.reset();
              router.replace('/(app)/dashboard');
            } catch {
              Alert.alert('Error', 'Failed to delete band');
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-orange-100 mb-6">Band Settings</Text>

        {/* Band Status */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-stone-700">
          <Text className="font-semibold text-gray-900 dark:text-white mb-2">Band Status</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-sm text-gray-700 dark:text-stone-300">Active</Text>
              <Text className="text-xs text-gray-500 dark:text-stone-500 mt-0.5">
                {isActive ? 'Band is active and visible to members' : 'Band is marked as inactive'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggleStatus}
              disabled={savingStatus}
              trackColor={{ false: '#d1d5db', true: '#2563eb' }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View className="border border-red-200 dark:border-red-800 rounded-lg p-4">
          <Text className="font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</Text>
          <Text className="text-sm text-gray-600 dark:text-stone-400 mb-4">
            Deleting the band will permanently remove all band data, shows, and documents. This action cannot be undone.
          </Text>
          <TouchableOpacity
            className="py-3 bg-red-600 rounded-lg items-center"
            onPress={handleDeleteBand}
          >
            <Text className="text-white font-semibold">Delete Band</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
