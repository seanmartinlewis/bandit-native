import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useBandStore } from '@/store/bandStore';
import { createBand } from '@/services/bandService';
import { acceptInvite, deleteInvite } from '@/services/inviteService';
import { addMember } from '@/services/bandService';
import type { Invite } from '@/types/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';

export default function DashboardScreen() {
  const bandStore = useBandStore();
  const [bandName, setBandName] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);

  useEffect(() => {
    bandStore.loadUserBands();
    bandStore.loadUserProfile();

    const user = auth.currentUser;
    if (!user?.email) return;

    const q = query(
      collection(db, 'invites'),
      where('email', '==', user.email.toLowerCase()),
      where('status', '==', 'pending'),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const invites: Invite[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setPendingInvites(invites);
    });
    return unsub;
  }, []);

  async function handleCreateBand() {
    const user = auth.currentUser;
    if (!user || !bandName.trim()) return;
    setCreating(true);
    try {
      const newBandId = await createBand(bandName.trim(), user.uid);
      await bandStore.refreshUserBands();
      router.push(`/(app)/band/${newBandId}/shows` as any);
    } catch {
      Alert.alert('Error', 'Failed to create band');
    } finally {
      setCreating(false);
    }
  }

  async function handleAcceptInvite(invite: Invite) {
    const user = auth.currentUser;
    if (!user) return;
    setProcessingInvite(invite.id);
    try {
      await addMember(invite.bandId, user.uid, invite.role);
      await acceptInvite(invite.id);
      await bandStore.refreshUserBands();
      await bandStore.loadBand(invite.bandId);
      router.push(`/(app)/band/${invite.bandId}/shows` as any);
    } catch {
      Alert.alert('Error', 'Failed to accept invite');
    } finally {
      setProcessingInvite(null);
    }
  }

  async function handleDeclineInvite(invite: Invite) {
    setProcessingInvite(invite.id);
    try {
      await deleteInvite(invite.id);
    } catch {
      Alert.alert('Error', 'Failed to decline invite');
    } finally {
      setProcessingInvite(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader />
      <ScrollView className="flex-1 p-4">
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <View className="space-y-3 mb-6">
            {pendingInvites.map((invite) => (
              <View key={invite.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-stone-700 rounded-lg p-4 shadow-sm">
                <Text className="text-sm text-gray-600 dark:text-stone-400 mb-1">You've been invited to join</Text>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{invite.bandName || 'a band'}</Text>
                <Text className="text-sm text-gray-600 dark:text-stone-300 mb-3">
                  Role: <Text className="capitalize font-medium">{invite.role}</Text>
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-green-600 py-2 rounded-lg items-center"
                    onPress={() => handleAcceptInvite(invite)}
                    disabled={processingInvite === invite.id}
                  >
                    <Text className="text-white font-medium">{processingInvite === invite.id ? 'Accepting...' : 'Accept'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg items-center"
                    onPress={() => handleDeclineInvite(invite)}
                    disabled={processingInvite === invite.id}
                  >
                    <Text className="text-gray-700 dark:text-stone-300 font-medium">Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Create Band Form (no bands and no pending invites) */}
        {bandStore.userBands.length === 0 && pendingInvites.length === 0 && (
          <View className="items-center pt-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Bandit</Text>
            <Text className="text-gray-600 dark:text-stone-300 mb-8 text-center">Get started by creating your first band</Text>
            <View className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-stone-700 rounded-lg p-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">Band Name *</Text>
              <TextInput
                className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                placeholder="Enter band name" placeholderTextColor="#9ca3af"
                value={bandName} onChangeText={setBandName}
              />
              <Text className="text-xs text-gray-500 mb-4">Choose a unique name for your band. You can change this later.</Text>
              <TouchableOpacity
                className={`py-3 rounded-lg items-center ${!bandName.trim() ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={handleCreateBand} disabled={creating || !bandName.trim()}
              >
                {creating ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Create Band</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Has bands, no invites */}
        {bandStore.userBands.length > 0 && pendingInvites.length === 0 && (
          <View className="items-center pt-12">
            <Text className="text-gray-600 dark:text-stone-300 text-center">Select a band from the menu to get started.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
