import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import type { Show, ScheduleEvent } from '@/types/firestore';
import { addScheduleEvent, removeScheduleEvent } from '@/services/showDetailsService';
import { useBandStore } from '@/store/bandStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Props { show: Show | null; onUpdated: () => void }

export default function ShowScheduleTab({ show, onUpdated }: Props) {
  const { currentRole } = useBandStore();
  const canEdit = ['admin', 'edit'].includes(currentRole || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ time: '', description: '' });
  const [saving, setSaving] = useState(false);

  const events = [...(show?.schedule?.events || [])].sort((a, b) => a.order - b.order);

  async function handleAdd() {
    if (!show || !form.time || !form.description) {
      Alert.alert('Error', 'Time and description are required');
      return;
    }
    setSaving(true);
    try {
      const event: ScheduleEvent = {
        id: Date.now().toString(),
        time: form.time,
        description: form.description,
        order: events.length,
      };
      await addScheduleEvent(show.id, event);
      await onUpdated();
      setModalOpen(false);
      setForm({ time: '', description: '' });
    } catch {
      Alert.alert('Error', 'Failed to add event');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(event: ScheduleEvent) {
    if (!show) return;
    Alert.alert('Remove Event?', `Remove "${event.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await removeScheduleEvent(show.id, event);
            await onUpdated();
          } catch {
            Alert.alert('Error', 'Failed to remove event');
          }
        },
      },
    ]);
  }

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-redhat-semibold text-gray-900 dark:text-orange-100">Schedule</Text>
        {canEdit && (
          <TouchableOpacity onPress={() => setModalOpen(true)} className="flex-row items-center gap-1 px-3 py-1 bg-bandit-primary dark:bg-bandit-primaryDark rounded-lg">
            <FontAwesome name="plus" size={12} color="white" />
            <Text className="text-white text-sm">Add Event</Text>
          </TouchableOpacity>
        )}
      </View>

      {events.length === 0 ? (
        <Text className="text-gray-500 dark:text-stone-500 text-sm text-center py-4">No schedule events yet</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} className="flex-row items-center p-3 mb-1.5 bg-gray-50 dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-stone-700">
            <View className="bg-bandit-primaryWash dark:bg-bandit-primaryWashDark px-2 py-0.5 rounded mr-3">
              <Text className="text-xs font-redhat-semibold text-bandit-primaryStrong dark:text-bandit-primarySoft">{event.time}</Text>
            </View>
            <Text className="flex-1 text-gray-900 dark:text-orange-100 text-sm">{event.description}</Text>
            {canEdit && (
              <TouchableOpacity onPress={() => handleRemove(event)} className="p-1">
                <FontAwesome name="times" size={14} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      <Modal visible={modalOpen} animationType="slide" transparent presentationStyle="overFullScreen">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white dark:bg-charcoal-900 rounded-t-2xl p-6">
            <Text className="font-redhat-semibold text-xl text-gray-900 dark:text-orange-100 mb-4">Add Schedule Event</Text>
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Time *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.time} onChangeText={(v) => setForm((f) => ({ ...f, time: v }))} placeholder="e.g. 6:00 PM" placeholderTextColor="#9ca3af" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Description *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-4 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="e.g. Load In, Sound Check" placeholderTextColor="#9ca3af" />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-charcoal-700 py-3 rounded-lg items-center" onPress={() => { setModalOpen(false); setForm({ time: '', description: '' }); }}>
                <Text className="text-gray-700 dark:text-stone-300 font-redhat-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-bandit-primary dark:bg-bandit-primaryDark py-3 rounded-lg items-center" onPress={handleAdd} disabled={saving}>
                <Text className="text-white font-redhat-medium">{saving ? 'Adding...' : 'Add Event'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
