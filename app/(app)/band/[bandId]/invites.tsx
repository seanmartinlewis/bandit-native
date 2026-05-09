import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useBrandTint } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useBandStore } from '@/store/bandStore';
import {
  createInvite, getInvitesForBand, revokeInvite,
} from '@/services/inviteService';
import type { Invite, BandRole } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ROLES: BandRole[] = ['admin', 'edit', 'read'];

export default function InvitesScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const tint = useBrandTint();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<BandRole>('edit');
  const [sending, setSending] = useState(false);

  useEffect(() => { loadInvites(); }, [bandId]);

  async function loadInvites() {
    setLoading(true);
    try {
      const data = await getInvitesForBand(bandId!);
      setInvites(data.filter((i) => i.status === 'pending'));
    } catch {
      Alert.alert('Error', 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite() {
    if (!email.trim()) { Alert.alert('Error', 'Email is required'); return; }
    setSending(true);
    try {
      await createInvite(bandId!, bandStore.currentBand?.name || '', email.trim().toLowerCase(), role);
      await loadInvites();
      setEmail('');
    } catch {
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setSending(false);
    }
  }

  async function handleRevoke(invite: Invite) {
    Alert.alert('Revoke Invite?', `Revoke invite for ${invite.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke', style: 'destructive',
        onPress: async () => {
          try {
            await revokeInvite(invite.id);
            await loadInvites();
          } catch {
            Alert.alert('Error', 'Failed to revoke invite');
          }
        },
      },
    ]);
  }

  const roleBg: Record<BandRole, string> = { admin: 'bg-orange-600', edit: 'bg-bandit-primary dark:bg-bandit-primaryDark', read: 'bg-green-600' };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-charcoal-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="font-redhat-semibold text-lg text-gray-900 dark:text-orange-100 mb-4">Invites</Text>

        {/* Send Invite Form */}
        <View className="bg-gray-50 dark:bg-charcoal-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-stone-700">
          <Text className="font-redhat-semibold text-gray-900 dark:text-orange-100 mb-3">Send Invite</Text>
          <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Email *</Text>
          <TextInput
            className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-700 text-gray-900 dark:text-orange-100"
            value={email} onChangeText={setEmail} placeholder="invitee@example.com" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none"
          />
          <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Role</Text>
          <View className="flex-row gap-2 mb-3">
            {ROLES.map((r) => (
              <TouchableOpacity key={r} onPress={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg items-center border ${role === r ? 'bg-bandit-primary dark:bg-bandit-primaryDark border-bandit-primary dark:border-bandit-primaryDark' : 'bg-white dark:bg-charcoal-700 border-gray-300 dark:border-stone-700'}`}>
                <Text className={`text-sm capitalize ${role === r ? 'text-white font-redhat-semibold' : 'text-gray-700 dark:text-stone-300'}`}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            className={`py-3 rounded-lg items-center ${!email.trim() || sending ? 'bg-bandit-primaryDisabled' : 'bg-bandit-primary dark:bg-bandit-primaryDark'}`}
            onPress={handleSendInvite} disabled={!email.trim() || sending}
          >
            {sending ? <ActivityIndicator color="white" /> : <Text className="text-white font-redhat-semibold">Send Invite</Text>}
          </TouchableOpacity>
        </View>

        {/* Pending Invites */}
        <Text className="font-redhat-semibold text-gray-900 dark:text-orange-100 mb-3">Pending Invites</Text>
        {loading ? <ActivityIndicator color={tint} className="py-4" /> : invites.length === 0 ? (
          <Text className="text-gray-500 dark:text-stone-500 text-sm text-center py-4">No pending invites</Text>
        ) : (
          invites.map((invite) => (
            <View key={invite.id} className="flex-row items-center p-3 mb-2 bg-gray-50 dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-stone-700">
              <View className="flex-1">
                <Text className="font-redhat-medium text-gray-900 dark:text-orange-100 text-sm">{invite.email}</Text>
                <View className={`self-start mt-1 px-2 py-0.5 rounded-full ${roleBg[invite.role]}`}>
                  <Text className="text-white text-xs capitalize">{invite.role}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleRevoke(invite)} className="ml-2 p-2">
                <FontAwesome name="times-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
