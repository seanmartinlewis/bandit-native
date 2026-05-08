import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/firebase';
import { createUserProfile } from '@/services/userProfileService';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasSymbol;
  const passwordsMatch = password === confirmPassword;

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Error', 'Password must be at least 8 characters with a number and symbol');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await createUserProfile(cred.user.uid, email.trim(), email.split('@')[0] || 'User');
      await sendEmailVerification(cred.user);
      Alert.alert('Account Created', 'Please check your email to verify your account.');
      router.replace('/(auth)/verify-email');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  const CheckItem = ({ met, label }: { met: boolean; label: string }) => (
    <View className="flex-row items-center gap-1 mt-1">
      <Text className={met ? 'text-green-600' : 'text-gray-400'}>{met ? '✓' : '•'}</Text>
      <Text className={`text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-100 dark:bg-gray-900" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center px-8 py-12">
          <Text className="text-4xl font-bold text-blue-600 dark:text-slate-400 mb-2 tracking-widest uppercase">Bandit</Text>
          <Text className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Create Account</Text>

          <View className="w-full space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">Email</Text>
              <TextInput
                className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="you@example.com" placeholderTextColor="#9ca3af"
                value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" autoComplete="email"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">Password</Text>
              <TextInput
                className={`w-full px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${password && !isPasswordValid ? 'border-red-500' : 'border-gray-300 dark:border-stone-700'}`}
                placeholder="••••••••" placeholderTextColor="#9ca3af"
                value={password} onChangeText={setPassword} secureTextEntry
              />
              <CheckItem met={hasMinLength} label="At least 8 characters" />
              <CheckItem met={hasNumber} label="Contains a number" />
              <CheckItem met={hasSymbol} label="Contains a symbol" />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-stone-400 mb-1">Confirm Password</Text>
              <TextInput
                className={`w-full px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-300 dark:border-stone-700'}`}
                placeholder="••••••••" placeholderTextColor="#9ca3af"
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry
              />
              {confirmPassword && !passwordsMatch && (
                <Text className="text-xs text-red-600 mt-1">Passwords do not match</Text>
              )}
            </View>

            <TouchableOpacity
              className={`w-full py-3 rounded-lg items-center mt-2 ${!isPasswordValid || !passwordsMatch || !email ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleRegister} disabled={loading || !isPasswordValid || !passwordsMatch || !email}
            >
              <Text className="text-white font-semibold text-base">{loading ? 'Creating...' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mt-6">
            <Text className="text-sm text-gray-600 dark:text-stone-300">Already have an account? </Text>
            <Link href="/(auth)/login" className="text-sm text-blue-600 dark:text-blue-400">Login</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
