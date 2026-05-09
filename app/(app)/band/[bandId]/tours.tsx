import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, Image,
} from 'react-native';
import { useBrandTint } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useBandStore } from '@/store/bandStore';
import { getToursForBand, createTour, deleteTour } from '@/services/tourService';
import type { Tour } from '@/types/firestore';
import { auth } from '@/firebase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ToursScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const tint = useBrandTint();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [saving, setSaving] = useState(false);
  const canEdit = ['admin', 'edit'].includes(bandStore.currentRole || '');

  useEffect(() => { loadTours(); }, [bandId]);

  async function loadTours() {
    setLoading(true);
    try {
      const data = await getToursForBand(bandId!);
      setTours(data.sort((a, b) => b.startDate.localeCompare(a.startDate)));
    } catch {
      Alert.alert('Error', 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const user = auth.currentUser;
    if (!user || !form.name || !form.startDate || !form.endDate) {
      Alert.alert('Error', 'Name, start date, and end date are required');
      return;
    }
    setSaving(true);
    try {
      await createTour(bandId!, form.name, form.startDate, form.endDate, user.uid, form.description);
      await loadTours();
      setModalOpen(false);
      setForm({ name: '', startDate: '', endDate: '', description: '' });
    } catch {
      Alert.alert('Error', 'Failed to create tour');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tour: Tour) {
    Alert.alert('Delete Tour?', `Delete "${tour.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteTour(tour.id);
            await loadTours();
          } catch {
            Alert.alert('Error', 'Failed to delete tour');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-charcoal-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-redhat-semibold text-lg text-gray-900 dark:text-orange-100">Tours</Text>
          {canEdit && (
            <TouchableOpacity onPress={() => setModalOpen(true)} className="flex-row items-center gap-1 px-3 py-1.5 bg-bandit-primary dark:bg-bandit-primaryDark rounded-lg">
              <FontAwesome name="plus" size={12} color="white" />
              <Text className="text-white text-sm font-redhat-medium">New Tour</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? <ActivityIndicator size="large" color={tint} className="py-12" /> : tours.length === 0 ? (
          <View className="py-12 items-center">
            <FontAwesome name="map-o" size={40} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-stone-500 text-sm mt-3">No tours yet</Text>
          </View>
        ) : (
          tours.map((tour) => (
            <TouchableOpacity
              key={tour.id}
              className="mb-3 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-stone-700 overflow-hidden shadow-sm"
              onPress={() => router.push(`/(app)/band/${bandId}/tour/${tour.id}` as any)}
            >
              <View className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 p-4 justify-end">
                {tour.posterUrl && <Image source={{ uri: tour.posterUrl }} className="absolute inset-0 w-full h-full" resizeMode="cover" />}
                <Text className="text-white font-bold text-lg" numberOfLines={1}>{tour.name}</Text>
              </View>
              <View className="p-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-700 dark:text-stone-300">
                    {formatDate(tour.startDate)} → {formatDate(tour.endDate)}
                  </Text>
                  {tour.description && <Text className="text-xs text-gray-500 dark:text-stone-500 mt-0.5" numberOfLines={1}>{tour.description}</Text>}
                </View>
                {canEdit && (
                  <TouchableOpacity onPress={() => handleDelete(tour)} className="p-2">
                    <FontAwesome name="trash-o" size={16} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent presentationStyle="overFullScreen">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white dark:bg-charcoal-900 rounded-t-2xl p-6">
            <Text className="font-redhat-semibold text-xl text-gray-900 dark:text-orange-100 mb-4">New Tour</Text>
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Tour Name *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Fall 2025 Tour" placeholderTextColor="#9ca3af" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Start Date (YYYY-MM-DD) *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.startDate} onChangeText={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="2025-10-01" placeholderTextColor="#9ca3af" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">End Date (YYYY-MM-DD) *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.endDate} onChangeText={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="2025-10-31" placeholderTextColor="#9ca3af" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Description</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-4 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional description" placeholderTextColor="#9ca3af" multiline />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-charcoal-700 py-3 rounded-lg items-center" onPress={() => { setModalOpen(false); setForm({ name: '', startDate: '', endDate: '', description: '' }); }}>
                <Text className="text-gray-700 dark:text-stone-300 font-redhat-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-bandit-primary dark:bg-bandit-primaryDark py-3 rounded-lg items-center" onPress={handleCreate} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-redhat-semibold">Create Tour</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
