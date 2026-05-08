import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import type { Show, SetListSong } from '@/types/firestore';
import { addSetListSong, removeSetListSong } from '@/services/showDetailsService';
import { useBandStore } from '@/store/bandStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Props { show: Show | null; onUpdated: () => void }

export default function ShowSetListTab({ show, onUpdated }: Props) {
  const { currentRole } = useBandStore();
  const canEdit = ['admin', 'edit'].includes(currentRole || '');
  const [songTitle, setSongTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedSetList = [...(show?.setList || [])].sort((a, b) => a.order - b.order);

  async function handleAdd() {
    if (!show || !songTitle.trim()) return;
    setSaving(true);
    try {
      const song: SetListSong = {
        id: Date.now().toString(),
        title: songTitle.trim(),
        order: sortedSetList.length,
      };
      await addSetListSong(show.id, song);
      await onUpdated();
      setSongTitle('');
    } catch {
      Alert.alert('Error', 'Failed to add song');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(song: SetListSong) {
    if (!show) return;
    Alert.alert('Remove Song?', `Remove "${song.title}" from set list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await removeSetListSong(show.id, song);
            await onUpdated();
          } catch {
            Alert.alert('Error', 'Failed to remove song');
          }
        },
      },
    ]);
  }

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-gray-900 dark:text-white">Set List</Text>
        <Text className="text-sm text-gray-500 dark:text-stone-500">{sortedSetList.length} songs</Text>
      </View>

      {canEdit && (
        <View className="flex-row gap-2 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            placeholder="Song title" placeholderTextColor="#9ca3af"
            value={songTitle} onChangeText={setSongTitle}
          />
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-lg items-center justify-center ${!songTitle.trim() ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleAdd} disabled={!songTitle.trim() || saving}
          >
            <Text className="text-white font-medium">Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {sortedSetList.length === 0 ? (
        <Text className="text-gray-500 dark:text-stone-500 text-sm text-center py-4">No songs in set list yet</Text>
      ) : (
        sortedSetList.map((song, idx) => (
          <View key={song.id} className="flex-row items-center p-3 mb-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-stone-700">
            <Text className="text-gray-500 dark:text-stone-500 text-sm w-7 font-medium">{idx + 1}.</Text>
            <Text className="flex-1 text-gray-900 dark:text-white text-sm">{song.title}</Text>
            {canEdit && (
              <TouchableOpacity onPress={() => handleRemove(song)} className="p-1">
                <FontAwesome name="times" size={14} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>
  );
}
