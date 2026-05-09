import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { banditColors, useBrandTint } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useBandStore } from '@/store/bandStore';
import { getUserProfile } from '@/services/userProfileService';
import type { BandRole, BandMemberTitle } from '@/types/firestore';

interface MemberInfo {
  userId: string;
  email: string;
  displayName: string;
  profilePictureUrl: string;
  role: BandRole;
  title?: BandMemberTitle;
}

function roleBorderColor(role: BandRole) {
  if (role === 'admin') return '#ea580c';
  if (role === 'edit') return banditColors.primary;
  return '#16a34a';
}
function roleTextColor(role: BandRole) {
  if (role === 'admin') return '#ea580c';
  if (role === 'edit') return banditColors.primary;
  return '#16a34a';
}

export default function MembersScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const tint = useBrandTint();
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = bandStore.currentRole === 'admin';

  useEffect(() => {
    loadMembers();
  }, [bandStore.currentBand?.members]);

  async function loadMembers() {
    const band = bandStore.currentBand;
    if (!band) return;
    setLoading(true);
    try {
      const list: MemberInfo[] = [];
      for (const [userId, memberData] of Object.entries(band.members)) {
        const profile = await getUserProfile(userId);
        list.push({
          userId,
          email: profile?.email || 'Unknown',
          displayName: profile?.displayName || 'Unknown',
          profilePictureUrl: profile?.profilePictureUrl || '',
          role: memberData.role,
          title: memberData.title,
        });
      }
      list.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return a.displayName.localeCompare(b.displayName);
      });
      setMembers(list);
    } catch {
      Alert.alert('Error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-charcoal-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="font-redhat-semibold text-lg text-gray-900 dark:text-orange-100 mb-4">Members</Text>
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={tint} />
          </View>
        ) : members.length === 0 ? (
          <Text className="text-gray-500 dark:text-stone-500 text-center py-8">No members found</Text>
        ) : (
          members.map((member) => (
            <View key={member.userId} className="flex-row items-center py-3 border-b border-gray-200 dark:border-stone-700">
              {/* Avatar */}
              <View className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-3 border-2 border-gray-200 dark:border-stone-700">
                {member.profilePictureUrl
                  ? <Image source={{ uri: member.profilePictureUrl }} className="w-12 h-12" />
                  : <Text className="text-white text-lg font-bold">{member.displayName.charAt(0).toUpperCase()}</Text>}
              </View>

              {/* Info */}
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center flex-wrap gap-1">
                  <Text className="font-redhat-medium text-gray-900 dark:text-orange-100 text-sm" numberOfLines={1}>
                    {member.displayName}
                  </Text>
                  {isAdmin && (
                    <Text className="text-xs px-1.5 py-0.5 rounded-full text-bandit-primary dark:text-bandit-primarySoft capitalize">
                      {member.role} access
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-gray-600 dark:text-stone-300" numberOfLines={1}>{member.email}</Text>
              </View>

              {/* Title Badge */}
              {member.title && (
                <View
                  className="ml-2 px-2 py-0.5 rounded-full border-2"
                  style={{ borderColor: roleBorderColor(member.role) }}
                >
                  <Text className="text-xs font-redhat-medium capitalize" style={{ color: roleTextColor(member.role) }}>
                    {member.title}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
