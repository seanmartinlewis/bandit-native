import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getShowsForBand, deleteShow } from '@/services/showService';
import type { Show } from '@/types/firestore';
import { useBandStore } from '@/store/bandStore';
import AppHeader from '@/components/AppHeader';

// Tab components (inline for brevity; can be split into separate files)
import ShowDetailsTab from '@/components/show-tabs/ShowDetailsTab';
import ShowContactsTab from '@/components/show-tabs/ShowContactsTab';
import ShowGuestListTab from '@/components/show-tabs/ShowGuestListTab';
import ShowSetListTab from '@/components/show-tabs/ShowSetListTab';
import ShowScheduleTab from '@/components/show-tabs/ShowScheduleTab';
import ShowNotesTab from '@/components/show-tabs/ShowNotesTab';
import ShowAccountingTab from '@/components/show-tabs/ShowAccountingTab';

const ALL_TABS = ['details', 'contacts', 'guestlist', 'setlist', 'schedule', 'notes', 'accounting'];

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ShowDetailsScreen() {
  const { bandId, showId } = useLocalSearchParams<{ bandId: string; showId: string }>();
  const bandStore = useBandStore();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('details');
  const isAdmin = bandStore.currentRole === 'admin';
  const tabs = ALL_TABS.filter((t) => t !== 'accounting' || isAdmin);

  const loadShow = useCallback(async () => {
    try {
      const shows = await getShowsForBand(bandId!);
      setShow(shows.find((s) => s.id === showId) || null);
    } catch {
      Alert.alert('Error', 'Failed to load show');
    } finally {
      setLoading(false);
    }
  }, [bandId, showId]);

  useEffect(() => { loadShow(); }, [loadShow]);

  async function handleDelete() {
    Alert.alert('Delete Show?', `Delete show at ${show?.venue}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteShow(showId!);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete show');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader bandId={bandId} />

      {/* Show Header */}
      <View className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
            {show?.isTravelDay ? 'Travel Day' : show?.venue}
          </Text>
          <View className="flex-row items-center gap-2">
            {isAdmin && !loading && (
              <TouchableOpacity onPress={handleDelete} className="p-1">
                <FontAwesome name="trash-o" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1">
              <FontAwesome name="chevron-left" size={14} color="#2563eb" />
              <Text className="text-sm text-blue-600 dark:text-blue-400">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-sm text-gray-600 dark:text-gray-400">{formatDate(show?.date)}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          {/* Tab Buttons */}
          <View className="px-4 pt-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    className={`px-3 py-1.5 rounded-lg ${currentTab === tab ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                    onPress={() => setCurrentTab(tab)}
                  >
                    <Text className={`text-xs font-medium capitalize ${currentTab === tab ? 'text-white' : 'text-gray-700 dark:text-stone-400'}`}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tab Content */}
          <ScrollView className="flex-1 px-4 pt-3" keyboardShouldPersistTaps="handled">
            {currentTab === 'details' && <ShowDetailsTab show={show} onUpdated={loadShow} />}
            {currentTab === 'contacts' && <ShowContactsTab show={show} onUpdated={loadShow} />}
            {currentTab === 'guestlist' && <ShowGuestListTab show={show} onUpdated={loadShow} />}
            {currentTab === 'setlist' && <ShowSetListTab show={show} onUpdated={loadShow} />}
            {currentTab === 'schedule' && <ShowScheduleTab show={show} onUpdated={loadShow} />}
            {currentTab === 'notes' && <ShowNotesTab show={show} onUpdated={loadShow} />}
            {currentTab === 'accounting' && isAdmin && <ShowAccountingTab showId={showId!} />}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
