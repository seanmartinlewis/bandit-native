import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!cred.user.emailVerified) {
        router.replace('/(auth)/verify-email');
        return;
      }

      router.replace('/(app)/boot');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100 dark:bg-charcoal-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-bitcount text-4xl text-bandit-primary dark:text-bandit-primarySoft mb-2 tracking-widest uppercase">
            Bandit
          </Text>
          <Text className="font-redhat-semibold text-2xl text-gray-900 dark:text-orange-100 mb-8">Login</Text>

          <View className="w-full space-y-4">
            <View>
              <Text className="text-sm font-redhat-medium text-gray-700 dark:text-stone-400 mb-1">Email</Text>
              <TextInput
                className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-redhat-medium text-gray-700 dark:text-stone-400">Password</Text>
                <Link href="/(auth)/forgot-password" className="text-xs text-bandit-primary dark:text-bandit-primarySoft">
                  Forgot password?
                </Link>
              </View>
              <TextInput
                className="w-full px-3 py-3 border border-gray-300 dark:border-stone-700 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              className="w-full bg-bandit-primary dark:bg-bandit-primaryDark py-3 rounded-lg items-center mt-2"
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-redhat-semibold text-base">
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mt-6">
            <Text className="text-sm text-gray-600 dark:text-stone-300">New here? </Text>
            <Link href="/(auth)/register" className="text-sm text-bandit-primary dark:text-bandit-primarySoft">
              Create Account
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
