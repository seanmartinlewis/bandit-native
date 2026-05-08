import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import type { Show } from '@/types/firestore';
import { updateShowNotes } from '@/services/showDetailsService';
import { useBandStore } from '@/store/bandStore';

interface Props { show: Show | null; onUpdated: () => void }

export default function ShowNotesTab({ show, onUpdated }: Props) {
  const { currentRole } = useBandStore();
  const canEdit = ['admin', 'edit'].includes(currentRole || '');
  const [notes, setNotes] = useState(show?.notes || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(show?.notes || '');
  }, [show?.notes]);

  async function handleSave() {
    if (!show) return;
    setSaving(true);
    try {
      await updateShowNotes(show.id, notes);
      await onUpdated();
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-gray-900 dark:text-white">Notes</Text>
        {canEdit && (
          editing ? (
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => { setNotes(show?.notes || ''); setEditing(false); }} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Text className="text-sm text-gray-700 dark:text-stone-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} className="px-3 py-1 bg-blue-600 rounded-lg">
                <Text className="text-sm text-white">{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Text className="text-sm text-gray-700 dark:text-stone-300">Edit</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {editing ? (
        <TextInput
          className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-h-[200px]"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          placeholder="Add show notes..."
          placeholderTextColor="#9ca3af"
        />
      ) : (
        <View className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-stone-700 min-h-[100px]">
          {notes ? (
            <Text className="text-gray-800 dark:text-stone-200 text-sm leading-relaxed">{notes}</Text>
          ) : (
            <Text className="text-gray-400 dark:text-stone-600 text-sm">{canEdit ? 'Tap Edit to add notes' : 'No notes added'}</Text>
          )}
        </View>
      )}
    </View>
  );
}
