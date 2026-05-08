import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { sendEmailVerification, reload, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useBandStore } from '@/store/bandStore';

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const bandStore = useBandStore();

  async function handleResend() {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      await sendEmailVerification(user);
      Alert.alert('Email Sent', 'Verification email has been resent. Check your inbox.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckVerification() {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        router.replace('/(app)/boot');
      } else {
        Alert.alert('Not Verified', 'Your email has not been verified yet. Please check your inbox.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to check verification');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    bandStore.reset();
    await signOut(auth);
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 px-8">
      <Text className="text-4xl font-bold text-blue-600 dark:text-slate-400 mb-2 tracking-widest uppercase">
        Bandit
      </Text>
      <Text className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Verify Your Email
      </Text>
      <Text className="text-sm text-gray-600 dark:text-stone-400 text-center mb-8">
        We sent a verification email to {auth.currentUser?.email}. Please verify your email to continue.
      </Text>

      <View className="w-full space-y-3">
        <TouchableOpacity
          className="w-full bg-blue-600 py-3 rounded-lg items-center"
          onPress={handleCheckVerification}
          disabled={loading}
        >
          <Text className="text-white font-semibold">I've Verified My Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-gray-200 dark:bg-gray-700 py-3 rounded-lg items-center"
          onPress={handleResend}
          disabled={loading}
        >
          <Text className="text-gray-700 dark:text-stone-300 font-semibold">Resend Verification Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full py-3 rounded-lg items-center"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 dark:text-red-400 text-sm">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
