import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import type { Show, GuestListEntry } from '@/types/firestore';
import { addGuestListEntry, removeGuestListEntry } from '@/services/showDetailsService';
import { auth } from '@/firebase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBandStore } from '@/store/bandStore';

interface Props { show: Show | null; onUpdated: () => void }

export default function ShowGuestListTab({ show, onUpdated }: Props) {
  const { currentRole, userProfile } = useBandStore();
  const canEdit = ['admin', 'edit'].includes(currentRole || '');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!show || !name.trim()) return;
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    try {
      const entry: GuestListEntry = {
        id: Date.now().toString(),
        name: name.trim(),
        addedBy: userProfile?.displayName || user.email || 'Unknown',
        addedAt: new Date(),
      };
      await addGuestListEntry(show.id, entry);
      await onUpdated();
      setName('');
    } catch {
      Alert.alert('Error', 'Failed to add guest');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(entry: GuestListEntry) {
    if (!show) return;
    Alert.alert('Remove Guest?', `Remove ${entry.name} from the guest list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await removeGuestListEntry(show.id, entry);
            await onUpdated();
          } catch {
            Alert.alert('Error', 'Failed to remove guest');
          }
        },
      },
    ]);
  }

  const totalSpots = show?.guestSpotsAvailable ?? null;
  const used = (show?.guestList || []).length;

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-gray-900 dark:text-white">Guest List</Text>
        {totalSpots !== null && (
          <View className={`px-2 py-0.5 rounded-full ${used >= totalSpots ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            <Text className={`text-xs font-semibold ${used >= totalSpots ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
              {used} / {totalSpots} spots used
            </Text>
          </View>
        )}
      </View>

      {canEdit && (
        <View className="flex-row gap-2 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            placeholder="Guest name" placeholderTextColor="#9ca3af"
            value={name} onChangeText={setName}
          />
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-lg items-center justify-center ${!name.trim() ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleAdd} disabled={!name.trim() || saving}
          >
            <Text className="text-white font-medium">Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {(show?.guestList || []).length === 0 ? (
        <Text className="text-gray-500 dark:text-stone-500 text-sm text-center py-4">No guests added yet</Text>
      ) : (
        (show?.guestList || []).map((entry, idx) => (
          <View key={entry.id} className="flex-row items-center p-3 mb-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-stone-700">
            <Text className="text-gray-500 dark:text-stone-500 text-sm w-6">{idx + 1}.</Text>
            <View className="flex-1">
              <Text className="font-medium text-gray-900 dark:text-white text-sm">{entry.name}</Text>
              <Text className="text-xs text-gray-500 dark:text-stone-500">Added by {entry.addedBy}</Text>
            </View>
            {canEdit && (
              <TouchableOpacity onPress={() => handleRemove(entry)} className="p-1">
                <FontAwesome name="times" size={14} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>
  );
}
