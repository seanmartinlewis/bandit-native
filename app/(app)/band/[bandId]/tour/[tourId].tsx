import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { banditColors, useBrandTint } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getShowsForBand } from '@/services/showService';
import type { Tour, Show } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TourDetailsScreen() {
  const { bandId, tourId } = useLocalSearchParams<{ bandId: string; tourId: string }>();
  const tint = useBrandTint();
  const [tour, setTour] = useState<Tour | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tourId]);

  async function load() {
    setLoading(true);
    try {
      const tourSnap = await getDoc(doc(db, 'tours', tourId!));
      let loadedTour: Tour | null = null;
      if (tourSnap.exists()) {
        const t = tourSnap.data();
        loadedTour = {
          id: tourSnap.id, bandId: t.bandId, name: t.name, description: t.description,
          posterUrl: t.posterUrl, startDate: t.startDate, endDate: t.endDate,
          createdAt: t.createdAt?.toDate() || new Date(), createdBy: t.createdBy,
        } as Tour;
        setTour(loadedTour);
      }
      const allShows = await getShowsForBand(bandId!);
      const tourShows = allShows.filter(
        (s) => loadedTour?.startDate && loadedTour?.endDate && s.date >= loadedTour.startDate && s.date <= loadedTour.endDate,
      );
      setShows(tourShows.sort((a, b) => a.date.localeCompare(b.date)));
    } catch {
      Alert.alert('Error', 'Failed to load tour');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-charcoal-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={tint} />
          </View>
        ) : (
          <>
            <View className="flex-row items-center mb-1">
              <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 mr-3">
                <FontAwesome name="chevron-left" size={14} color={banditColors.primary} />
                <Text className="text-bandit-primary text-sm">Tours</Text>
              </TouchableOpacity>
            </View>
            <Text className="font-redhat-bold text-2xl text-gray-900 dark:text-orange-100 mb-1">{tour?.name}</Text>
            <Text className="text-sm text-gray-600 dark:text-stone-400 mb-3">
              {tour?.startDate && tour?.endDate ? `${formatDate(tour.startDate)} → ${formatDate(tour.endDate)}` : ''}
            </Text>
            {tour?.description && (
              <Text className="text-sm text-gray-700 dark:text-stone-300 mb-4 leading-relaxed">{tour.description}</Text>
            )}

            <Text className="font-redhat-semibold text-gray-900 dark:text-orange-100 mb-3">
              Shows ({shows.length})
            </Text>
            {shows.length === 0 ? (
              <Text className="text-gray-500 dark:text-stone-500 text-sm text-center py-4">
                No shows in this tour's date range
              </Text>
            ) : (
              shows.map((show) => (
                <TouchableOpacity
                  key={show.id}
                  className="flex-row items-center p-3 mb-2 bg-gray-50 dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-stone-700"
                  onPress={() => router.push(`/(app)/band/${bandId}/show/${show.id}` as any)}
                >
                  <View className="w-12 h-12 bg-bandit-primaryWash dark:bg-bandit-primaryWashDark rounded-lg items-center justify-center mr-3">
                    <Text className="text-xs font-bold text-bandit-primaryStrong dark:text-bandit-primarySoft">
                      {new Date(show.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </Text>
                    <Text className="text-lg font-bold text-bandit-primaryStrong dark:text-bandit-primarySoft">
                      {new Date(show.date + 'T00:00:00').getDate()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-redhat-medium text-sm ${show.isTravelDay ? 'text-amber-700 dark:text-amber-400 italic' : 'text-gray-900 dark:text-orange-100'}`} numberOfLines={1}>
                      {show.isTravelDay ? 'Travel Day' : show.venue}
                    </Text>
                    {!show.isTravelDay && (
                      <Text className="text-xs text-gray-600 dark:text-stone-400">{show.city}, {show.state}</Text>
                    )}
                  </View>
                  <FontAwesome name="chevron-right" size={12} color="#9ca3af" />
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
