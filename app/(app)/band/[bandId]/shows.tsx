import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput,
  ActivityIndicator, Alert, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getShowsForBand, createShow } from '@/services/showService';
import type { Show } from '@/types/firestore';
import { useBandStore } from '@/store/bandStore';
import { auth } from '@/firebase';
import AppHeader from '@/components/AppHeader';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDayNum(dateStr: string): string {
  const [, , d] = dateStr.split('-');
  return d ? parseInt(d, 10).toString() : '';
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!;
}

interface CalendarDay { date: string; isToday: boolean; shows: Show[] }

export default function ShowsScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [creatingShow, setCreatingShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newShow, setNewShow] = useState({ venue: '', city: '', state: '', isTravelDay: false });
  const today = todayStr();
  const canEdit = ['admin', 'edit'].includes(bandStore.currentRole || '');

  useEffect(() => {
    loadShows();
  }, [bandId]);

  async function loadShows() {
    try {
      const data = await getShowsForBand(bandId!);
      setShows(data);
    } catch {
      Alert.alert('Error', 'Failed to load shows');
    } finally {
      setLoading(false);
    }
  }

  const weekDays = useCallback((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const base = getWeekStart(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]!;
      days.push({ date: dateStr, isToday: dateStr === today, shows: shows.filter((s) => s.date === dateStr) });
    }
    return days;
  }, [shows, weekOffset, today]);

  const days = weekDays();
  const firstDay = new Date(days[0]!.date);

  const futureShows = shows
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const lastDay = new Date(days[6]!.date);
  const weekRangeTitle = firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Simple swipe detection
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) > 50) {
        setWeekOffset((o) => o + (gs.dx < 0 ? 1 : -1));
      }
    },
  });

  async function handleCreateShow() {
    const user = auth.currentUser;
    if (!user || (!newShow.isTravelDay && (!newShow.venue || !newShow.city || !newShow.state))) {
      Alert.alert('Error', 'Please fill in venue, city, and state');
      return;
    }
    setCreatingShow(true);
    try {
      const showId = await createShow(bandId!, {
        date: selectedDate,
        venue: newShow.venue || 'Travel Day',
        city: newShow.city || 'TBD',
        state: newShow.state || 'TBD',
        createdBy: user.uid,
        isTravelDay: newShow.isTravelDay,
      });
      await loadShows();
      setShowModal(false);
      setNewShow({ venue: '', city: '', state: '', isTravelDay: false });
      router.push(`/(app)/band/${bandId}/show/${showId}` as any);
    } catch {
      Alert.alert('Error', 'Failed to create show');
    } finally {
      setCreatingShow(false);
    }
  }

  // Shared toggle header used in both views
  const ViewToggle = () => (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-lg font-semibold text-gray-900 dark:text-orange-100">
        {viewMode === 'list' ? 'Upcoming Shows' : 'Shows Calendar'}
      </Text>
      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        <TouchableOpacity
          className={`px-3 py-1 rounded-md ${viewMode === 'week' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
          onPress={() => setViewMode('week')}
        >
          <Text className={`text-sm font-medium ${viewMode === 'week' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-stone-400'}`}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-3 py-1 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
          onPress={() => setViewMode('list')}
        >
          <Text className={`text-sm font-medium ${viewMode === 'list' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-stone-400'}`}>List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader bandId={bandId} />

      {/* LIST VIEW — ScrollView directly after AppHeader, matching members.tsx pattern */}
      {viewMode === 'list' ? (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <ViewToggle />
          {loading ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : futureShows.length === 0 ? (
            <View className="py-16 items-center">
              <Text className="text-base font-medium text-gray-500 dark:text-stone-400">No upcoming shows</Text>
              {canEdit && <Text className="text-sm text-gray-400 dark:text-stone-500 mt-1">Switch to Week view to add shows</Text>}
            </View>
          ) : (
            futureShows.map((show) => (
              <TouchableOpacity
                key={show.id}
                className="flex-row items-center py-3 border-b border-gray-200 dark:border-stone-700"
                onPress={() => router.push(`/(app)/band/${bandId}/show/${show.id}` as any)}
              >
                <View className="w-24">
                  <Text className="text-xs font-medium uppercase text-gray-500 dark:text-stone-400">
                    {formatDayName(show.date)}
                  </Text>
                  <Text className={`text-sm font-semibold ${show.isTravelDay ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-orange-100'}`}>
                    {new Date(show.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className={`text-sm font-medium ${show.isTravelDay ? 'text-amber-700 dark:text-amber-400 italic' : 'text-gray-900 dark:text-orange-100'}`} numberOfLines={1}>
                    {show.isTravelDay ? '🚗 Travel Day' : show.venue}
                  </Text>
                  {!show.isTravelDay && (
                    <Text className="text-xs text-gray-500 dark:text-stone-400 mt-0.5">{show.city}, {show.state}</Text>
                  )}
                </View>
                <FontAwesome name="chevron-right" size={14} color="#9ca3af" style={{ marginRight: 4 }} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        /* WEEK VIEW — View wrapper to support panHandlers + pinned week nav */
        <View className="flex-1 px-4 pt-4">
          <ViewToggle />
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <>
              <View className="flex-1" {...panResponder.panHandlers}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day.date}
                      className={`flex-row items-center border rounded-lg mb-1.5 min-h-[72px] ${
                        day.shows.length > 0
                          ? day.shows[0]?.isTravelDay
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
                            : 'bg-blue-50 dark:bg-slate-700/30 border-gray-200 dark:border-stone-700'
                          : day.isToday
                            ? 'bg-blue-50 dark:bg-gray-700/30 border-blue-200 dark:border-blue-700/50'
                            : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-stone-700'
                      }`}
                      onPress={() => {
                        if (day.shows.length > 0) {
                          router.push(`/(app)/band/${bandId}/show/${day.shows[0]?.id}` as any);
                        } else if (canEdit) {
                          setSelectedDate(day.date);
                          setShowModal(true);
                        }
                      }}
                      disabled={!canEdit && day.shows.length === 0}
                    >
                      <View className="w-1/4 items-center border-r border-gray-200 dark:border-stone-700 py-2">
                        <Text className={`text-xs font-semibold uppercase ${day.shows.length > 0 ? 'text-gray-900 dark:text-orange-100' : 'text-gray-300 dark:text-stone-500'}`}>{formatDayName(day.date)}</Text>
                        <Text className={`text-3xl font-bold ${day.shows.length > 0 ? 'text-gray-700 dark:text-stone-300' : 'text-gray-300 dark:text-stone-500'}`}>{formatDayNum(day.date)}</Text>
                      </View>
                      <View className="flex-1 px-3 py-2">
                        {day.shows.length > 0 ? (
                          <>
                            <Text className={`text-sm font-medium ${day.shows[0]?.isTravelDay ? 'text-amber-700 dark:text-amber-400 italic' : 'text-gray-800 dark:text-orange-100'}`} numberOfLines={1}>
                              {day.shows[0]?.isTravelDay ? 'Travel Day' : day.shows[0]?.venue}
                            </Text>
                            {!day.shows[0]?.isTravelDay && (
                              <Text className="text-xs text-gray-600 dark:text-slate-300">{day.shows[0]?.city}, {day.shows[0]?.state}</Text>
                            )}
                            {day.shows.length > 1 && <Text className="text-xs text-gray-500 mt-0.5">+{day.shows.length - 1} more</Text>}
                          </>
                        ) : (
                          <Text className="text-sm text-gray-400 dark:text-slate-500">{canEdit ? '+ Add show' : 'Day Off'}</Text>
                        )}
                      </View>
                      {day.isToday && day.shows.length > 0 && (
                        <View className="mr-2 bg-blue-600 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <Text className="text-white text-xs">Today</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Week Navigation */}
              <View className="flex-row items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                <TouchableOpacity className="p-2 rounded-lg" onPress={() => setWeekOffset((o) => o - 1)}>
                  <FontAwesome name="chevron-left" size={16} color="#374151" />
                </TouchableOpacity>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">{weekRangeTitle}</Text>
                <TouchableOpacity className="p-2 rounded-lg" onPress={() => setWeekOffset((o) => o + 1)}>
                  <FontAwesome name="chevron-right" size={16} color="#374151" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Create Show Modal */}
      <Modal visible={showModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white dark:bg-gray-900 rounded-t-2xl p-6">
            <Text className="text-xl font-semibold text-gray-900 dark:text-orange-100 mb-4">
              {newShow.isTravelDay ? 'Create Travel Day' : 'Create Show'}
            </Text>
            <View className="flex-row items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
              <TouchableOpacity
                className={`w-5 h-5 rounded border-2 ${newShow.isTravelDay ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} items-center justify-center`}
                onPress={() => setNewShow((n) => ({ ...n, isTravelDay: !n.isTravelDay }))}
              >
                {newShow.isTravelDay && <FontAwesome name="check" size={10} color="white" />}
              </TouchableOpacity>
              <Text className="text-sm text-gray-700 dark:text-stone-300">This is a travel day</Text>
            </View>
            {!newShow.isTravelDay && (
              <>
                <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">Venue *</Text>
                <TextInput className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3" placeholder="Venue name" placeholderTextColor="#9ca3af" value={newShow.venue} onChangeText={(v) => setNewShow((n) => ({ ...n, venue: v }))} />
                <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">City *</Text>
                <TextInput className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3" placeholder="City" placeholderTextColor="#9ca3af" value={newShow.city} onChangeText={(v) => setNewShow((n) => ({ ...n, city: v }))} />
                <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">State *</Text>
                <TextInput className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3" placeholder="State" placeholderTextColor="#9ca3af" value={newShow.state} onChangeText={(v) => setNewShow((n) => ({ ...n, state: v }))} />
              </>
            )}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg items-center" onPress={() => setShowModal(false)}>
                <Text className="text-gray-700 dark:text-stone-300 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-lg items-center" onPress={handleCreateShow} disabled={creatingShow}>
                {creatingShow ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">{newShow.isTravelDay ? 'Create Travel Day' : 'Create Show'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
