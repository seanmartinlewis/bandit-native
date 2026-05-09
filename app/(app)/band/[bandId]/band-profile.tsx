import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useBandStore } from '@/store/bandStore';
import { updateBandProfile } from '@/services/bandService';

export default function BandProfileScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const band = bandStore.currentBand;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: band?.name || '', bio: band?.bio || '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) { Alert.alert('Error', 'Band name is required'); return; }
    setSaving(true);
    try {
      await updateBandProfile(bandId!, { name: form.name.trim(), bio: form.bio.trim() });
      await bandStore.loadBand(bandId!);
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-charcoal-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-redhat-semibold text-lg text-gray-900 dark:text-orange-100">Band Profile</Text>
          {editing ? (
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => { setForm({ name: band?.name || '', bio: band?.bio || '' }); setEditing(false); }} className="px-3 py-1.5 bg-gray-100 dark:bg-charcoal-700 rounded-lg">
                <Text className="text-sm text-gray-700 dark:text-stone-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} className="px-3 py-1.5 bg-bandit-primary dark:bg-bandit-primaryDark rounded-lg">
                <Text className="text-sm text-white">{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} className="px-3 py-1.5 bg-gray-100 dark:bg-charcoal-700 rounded-lg">
              <Text className="text-sm text-gray-700 dark:text-stone-300">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Picture */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center border-2 border-gray-200 dark:border-stone-700">
            {band?.profilePictureUrl
              ? <Image source={{ uri: band.profilePictureUrl }} className="w-24 h-24" resizeMode="cover" />
              : <Text className="text-white text-3xl font-bold">{band?.name?.charAt(0).toUpperCase() || 'B'}</Text>}
          </View>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Band Name *</Text>
          {editing ? (
            <TextInput
              className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100"
              value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Band name" placeholderTextColor="#9ca3af"
            />
          ) : (
            <Text className="text-gray-900 dark:text-orange-100 font-redhat-medium text-base">{band?.name || '—'}</Text>
          )}
        </View>

        {/* Bio */}
        <View className="mb-4">
          <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Bio</Text>
          {editing ? (
            <TextInput
              className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100 min-h-[120px]"
              value={form.bio} onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
              placeholder="Tell us about your band..." placeholderTextColor="#9ca3af"
              multiline textAlignVertical="top"
            />
          ) : (
            <Text className="text-gray-700 dark:text-stone-300 text-sm leading-relaxed">{band?.bio || '—'}</Text>
          )}
        </View>

        {/* Media Links */}
        {(band?.mediaLinks || []).length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-2">Media Links</Text>
            {(band?.mediaLinks || []).map((link) => (
              <View key={link.id} className="flex-row items-center p-3 mb-1.5 bg-gray-50 dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-stone-700">
                <View className="flex-1">
                  <Text className="text-sm font-redhat-medium text-gray-900 dark:text-orange-100">{link.title}</Text>
                  <Text className="text-xs text-bandit-primary dark:text-bandit-primarySoft" numberOfLines={1}>{link.url}</Text>
                </View>
                <View className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-charcoal-700 rounded-full">
                  <Text className="text-xs text-gray-600 dark:text-stone-400 capitalize">{link.type}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
