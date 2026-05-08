import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { auth } from '@/firebase';
import { useBandStore } from '@/store/bandStore';
import { updateUserProfile } from '@/services/userProfileService';
import type { Instrument, MediaLink } from '@/types/firestore';

const INSTRUMENTS: Instrument[] = [
  'vocals',
  'guitar',
  'bass',
  'drums',
  'keyboard',
  'production',
  'tour manager',
  'sound engineering',
  'merchandising',
];

export default function ProfileScreen() {
  const bandStore = useBandStore();
  const user = auth.currentUser;
  const profile = bandStore.userProfile;
  const [activeTab, setActiveTab] = useState<'contact' | 'bio' | 'instruments' | 'media' | 'account'>('contact');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    website: '',
    bio: '',
    showPhone: false,
    isPublic: false,
    instruments: [] as Instrument[],
    mediaLinks: [] as MediaLink[],
  });

  useEffect(() => {
    bandStore.loadUserProfile();
    if (bandStore.lastViewedBandId && !bandStore.currentBand) {
      bandStore.loadBand(bandStore.lastViewedBandId).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName || '',
      phone: profile.phone || '',
      website: profile.website || '',
      bio: profile.bio || '',
      showPhone: profile.showPhone,
      isPublic: profile.isPublic,
      instruments: profile.instruments || [],
      mediaLinks: profile.mediaLinks || [],
    });
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    if (!form.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        bio: form.bio.trim(),
        showPhone: form.showPhone,
        isPublic: form.isPublic,
        instruments: form.instruments,
        mediaLinks: form.mediaLinks,
      });
      await bandStore.refreshUserProfile();
      Alert.alert('Saved', 'Your profile has been updated');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function toggleInstrument(instrument: Instrument) {
    setForm((current) => ({
      ...current,
      instruments: current.instruments.includes(instrument)
        ? current.instruments.filter((item) => item !== instrument)
        : [...current.instruments, instrument],
    }));
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <AppHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader />
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-600">
            {profile.profilePictureUrl ? (
              <Image source={{ uri: profile.profilePictureUrl }} className="h-16 w-16" resizeMode="cover" />
            ) : (
              <Text className="text-2xl font-bold text-white">
                {(form.displayName || profile.email || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">User Profile</Text>
            <Text className="text-sm text-gray-500 dark:text-stone-400" numberOfLines={1}>
              {profile.email}
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {(['contact', 'bio', 'instruments', 'media', 'account'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-2 ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <Text className={`text-xs font-medium capitalize ${activeTab === tab ? 'text-white' : 'text-gray-700 dark:text-stone-400'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {activeTab === 'contact' && (
          <View className="gap-4">
            <Field label="Display Name" value={form.displayName} onChangeText={(displayName) => setForm((f) => ({ ...f, displayName }))} />
            <Field label="Phone" value={form.phone} keyboardType="phone-pad" onChangeText={(phone) => setForm((f) => ({ ...f, phone }))} />
            <Field label="Website" value={form.website} autoCapitalize="none" onChangeText={(website) => setForm((f) => ({ ...f, website }))} />
          </View>
        )}

        {activeTab === 'bio' && (
          <TextInput
            className="min-h-[160px] rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-stone-700 dark:bg-gray-800 dark:text-white"
            value={form.bio}
            onChangeText={(bio) => setForm((f) => ({ ...f, bio }))}
            placeholder="Tell bandmates a little about yourself"
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
          />
        )}

        {activeTab === 'instruments' && (
          <View className="flex-row flex-wrap gap-2">
            {INSTRUMENTS.map((instrument) => {
              const selected = form.instruments.includes(instrument);
              return (
                <TouchableOpacity
                  key={instrument}
                  onPress={() => toggleInstrument(instrument)}
                  className={`rounded-full px-3 py-2 ${selected ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <Text className={`text-sm capitalize ${selected ? 'text-white' : 'text-gray-700 dark:text-stone-300'}`}>
                    {instrument}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === 'media' && (
          <View className="gap-2">
            {form.mediaLinks.length === 0 ? (
              <Text className="text-sm text-gray-500 dark:text-stone-400">No media links yet.</Text>
            ) : (
              form.mediaLinks.map((link) => (
                <View key={link.id} className="rounded-lg border border-gray-200 p-3 dark:border-stone-700">
                  <Text className="font-medium text-gray-900 dark:text-white">{link.title}</Text>
                  <Text className="text-sm text-gray-500 dark:text-stone-400" numberOfLines={1}>{link.url}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'account' && (
          <View className="gap-4">
            <Toggle label="Show Phone" value={form.showPhone} onValueChange={(showPhone) => setForm((f) => ({ ...f, showPhone }))} />
            <Toggle label="Public Profile" value={form.isPublic} onValueChange={(isPublic) => setForm((f) => ({ ...f, isPublic }))} />
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="mb-8 mt-6 items-center rounded-lg bg-blue-600 py-3"
        >
          <Text className="font-semibold text-white">{saving ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View>
      <Text className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-stone-500">{label}</Text>
      <TextInput
        {...inputProps}
        className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-stone-700 dark:bg-gray-800 dark:text-white"
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

function Toggle({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-stone-700">
      <Text className="font-medium text-gray-900 dark:text-white">{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#d1d5db', true: '#2563eb' }} />
    </View>
  );
}
