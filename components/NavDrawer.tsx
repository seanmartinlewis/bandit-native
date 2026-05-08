import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Pressable, ScrollView, Image,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useBandStore } from '@/store/bandStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bandId?: string;
}

export default function NavDrawer({ isOpen, onClose, bandId }: NavDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const bandStore = useBandStore();
  const pathname = usePathname();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: isOpen ? 0 : -280, duration: 300, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: isOpen ? 1 : 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      bandStore.loadUserBands();
      bandStore.loadUserProfile();
      bandStore.refreshUserProfile();
    }
  }, [isOpen]);

  const navigate = (href: string) => {
    onClose();
    setTimeout(() => router.push(href as any), 100);
  };

  const isAdmin = bandStore.currentRole === 'admin';
  const canEdit = ['admin', 'edit'].includes(bandStore.currentRole || '');
  const currentBandId = bandId || bandStore.currentBand?.id || '';
  const otherBands = bandStore.userBands.filter((b) => b.id !== currentBandId);

  const getTabFromPath = () => {
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/invites')) return 'invites';
    if (pathname.includes('/members')) return 'members';
    if (pathname.includes('/messages')) return 'messages';
    if (pathname.includes('/documents')) return 'documents';
    if (pathname.includes('/tours')) return 'tours';
    if (pathname.includes('/profile')) return 'profile';
    return 'shows';
  };
  const currentTab = getTabFromPath();

  const NavItem = ({ tab, icon, label, href }: { tab: string; icon: string; label: string; href: string }) => (
    <TouchableOpacity
      className={`flex-row items-center gap-2 px-3 py-2 rounded-lg mb-0.5 ${currentTab === tab ? 'bg-blue-50 dark:bg-gray-800' : ''}`}
      onPress={() => navigate(href)}
    >
      <FontAwesome name={icon as any} size={16} color={currentTab === tab ? '#2563eb' : '#6b7280'} />
      <Text className={`text-sm font-medium ${currentTab === tab ? 'text-blue-700 dark:text-slate-300' : 'text-gray-700 dark:text-stone-400'}`}>{label}</Text>
    </TouchableOpacity>
  );

  const bandPic = bandStore.currentBand?.profilePictureUrl;
  const bandName = bandStore.currentBand?.name || '';

  return (
    <>
      {isOpen && (
        <Animated.View style={{ position: 'absolute', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayAnim }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
      )}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, zIndex: 50, transform: [{ translateX: slideAnim }] }}
        className="bg-white dark:bg-gray-900 shadow-xl">
        <ScrollView className="flex-1 pt-12">
          {/* Band / User Info */}
          <View className="p-4">
            {bandStore.currentBand ? (
              <View>
                <View className="w-full h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 mb-2">
                  {bandPic ? <Image source={{ uri: bandPic }} className="w-full h-full" resizeMode="cover" />
                    : <View className="flex-1 items-center justify-center"><Text className="text-white text-2xl font-bold">{bandName.charAt(0).toUpperCase()}</Text></View>}
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white">{bandName}</Text>
                <View className={`self-start px-2 py-0.5 rounded-full mt-1 ${isAdmin ? 'bg-orange-600' : canEdit ? 'bg-blue-600' : 'bg-green-600'}`}>
                  <Text className="text-white text-xs capitalize">{bandStore.currentRole}</Text>
                </View>
              </View>
            ) : (
              <View>
                <View className="w-full h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 mb-2">
                  {bandStore.userProfile?.profilePictureUrl
                    ? <Image source={{ uri: bandStore.userProfile.profilePictureUrl }} className="w-full h-full" resizeMode="cover" />
                    : <View className="flex-1 items-center justify-center"><Text className="text-white text-2xl font-bold">{bandStore.userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}</Text></View>}
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white">{bandStore.userProfile?.displayName || 'User'}</Text>
                <Text className="text-xs text-gray-500 dark:text-stone-500">No bands yet</Text>
              </View>
            )}
          </View>

          {/* Navigation */}
          <View className="px-2">
            {bandStore.currentBand ? (
              <>
                <NavItem tab="shows" icon="calendar" label="Shows" href={`/(app)/band/${currentBandId}/shows`} />
                <NavItem tab="members" icon="users" label="Members" href={`/(app)/band/${currentBandId}/members`} />
                <NavItem tab="documents" icon="file-text-o" label="Documents" href={`/(app)/band/${currentBandId}/documents`} />
                <NavItem tab="messages" icon="comments-o" label="Messages" href={`/(app)/band/${currentBandId}/messages`} />
                {canEdit && <NavItem tab="tours" icon="globe" label="Tours" href={`/(app)/band/${currentBandId}/tours`} />}
                {isAdmin && (
                  <>
                    <NavItem tab="profile" icon="id-card-o" label="Band Profile" href={`/(app)/band/${currentBandId}/band-profile`} />
                    <NavItem tab="invites" icon="envelope-o" label="Invites" href={`/(app)/band/${currentBandId}/invites`} />
                    <NavItem tab="settings" icon="cog" label="Settings" href={`/(app)/band/${currentBandId}/settings`} />
                  </>
                )}

                {otherBands.length > 0 && (
                  <View className="mt-4 pt-4 border-t border-gray-200 dark:border-stone-700">
                    <Text className="px-2 text-xs font-semibold text-gray-500 dark:text-stone-500 uppercase mb-2">Other Bands</Text>
                    {otherBands.map((band) => (
                      <TouchableOpacity key={band.id} className="flex-row items-center gap-2 px-3 py-2 rounded-lg" onPress={() => navigate(`/(app)/band/${band.id}/shows`)}>
                        <View className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
                          {band.profilePictureUrl ? <Image source={{ uri: band.profilePictureUrl }} className="w-5 h-5" />
                            : <Text className="text-white text-xs font-bold">{band.name.charAt(0).toUpperCase()}</Text>}
                        </View>
                        <Text className="text-sm text-gray-700 dark:text-stone-400 flex-1" numberOfLines={1}>{band.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View className="mt-4 pt-4 border-t border-gray-200 dark:border-stone-700">
                  <Text className="px-2 text-xs font-semibold text-gray-500 dark:text-stone-500 uppercase mb-2">User Profile</Text>
                  <TouchableOpacity className="flex-row items-center gap-2 px-3 py-2 rounded-lg" onPress={() => navigate('/(app)/profile')}>
                    <FontAwesome name="user-circle-o" size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-700 dark:text-stone-400">My Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <NavItem tab="dashboard" icon="home" label="Dashboard" href="/(app)/dashboard" />
                <NavItem tab="profile" icon="user-circle-o" label="Profile" href="/(app)/profile" />
              </>
            )}

            <View className="mt-4 pt-4 border-t border-gray-200 dark:border-stone-700 mb-8">
              <TouchableOpacity className="flex-row items-center gap-2 px-3 py-2 rounded-lg" onPress={async () => { onClose(); await signOut(auth); router.replace('/(auth)/login'); }}>
                <FontAwesome name="sign-out" size={16} color="#ef4444" />
                <Text className="text-sm text-red-600 dark:text-red-400">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}
