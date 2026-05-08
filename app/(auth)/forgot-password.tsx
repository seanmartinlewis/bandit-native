import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100 dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl font-bold text-blue-600 dark:text-slate-400 mb-2 tracking-widest uppercase">
            Bandit
          </Text>
          <Text className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Reset Password
          </Text>
          <Text className="text-sm text-gray-600 dark:text-stone-400 text-center mb-8">
            Enter your email and we'll send you a link to reset your password
          </Text>

          {sent ? (
            <View className="items-center">
              <Text className="text-green-600 dark:text-green-400 text-center mb-4">
                Reset email sent! Check your inbox.
              </Text>
              <Link href="/(auth)/login" className="text-blue-600 dark:text-blue-400">
                Back to Login
              </Link>
            </View>
          ) : (
            <View className="w-full space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">Email</Text>
                <TextInput
                  className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <TouchableOpacity
                className="w-full bg-blue-600 py-3 rounded-lg items-center mt-2"
                onPress={handleReset}
                disabled={loading}
              >
                <Text className="text-white font-semibold text-base">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-2">
                <Link href="/(auth)/login" className="text-sm text-blue-600 dark:text-blue-400">
                  Back to Login
                </Link>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
