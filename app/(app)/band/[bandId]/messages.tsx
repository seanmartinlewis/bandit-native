import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { auth } from '@/firebase';
import { useBandStore } from '@/store/bandStore';
import { sendMessage, updateMessage, deleteMessage, subscribeToMessages } from '@/services/messageService';
import type { BandMessage } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function MessagesScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const [messages, setMessages] = useState<BandMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsub = subscribeToMessages(bandId!, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [bandId]);

  async function handleSend() {
    if (!messageText.trim() || !currentUser) return;
    setSending(true);
    try {
      await sendMessage(
        bandId!,
        currentUser.uid,
        bandStore.userProfile?.displayName || currentUser.email || 'Unknown',
        bandStore.userProfile?.profilePictureUrl,
        messageText.trim(),
      );
      setMessageText('');
    } catch {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleEdit(msg: BandMessage) {
    setEditingId(msg.id);
    setEditText(msg.message);
  }

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) return;
    try {
      await updateMessage(id, editText.trim());
      setEditingId(null);
      setEditText('');
    } catch {
      Alert.alert('Error', 'Failed to edit message');
    }
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Message?', 'Delete this message permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage(id);
          } catch {
            Alert.alert('Error', 'Failed to delete message');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <Text className="px-4 pt-3 pb-1 text-lg font-semibold text-gray-900 dark:text-orange-100">Messages</Text>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView ref={scrollRef} className="flex-1 px-3 pt-2" keyboardShouldPersistTaps="handled">
          {messages.map((msg) => {
            const isOwn = msg.userId === currentUser?.uid;
            return (
              <View key={msg.id} className={`mb-3 flex-row ${isOwn ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <View className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mx-2 mt-1">
                  {msg.userPhotoUrl
                    ? <Image source={{ uri: msg.userPhotoUrl }} className="w-8 h-8" />
                    : <Text className="text-white text-xs font-bold">{msg.userName.charAt(0).toUpperCase()}</Text>}
                </View>

                {/* Bubble */}
                <View className={`max-w-[75%]`}>
                  {!isOwn && <Text className="text-xs font-semibold text-gray-700 dark:text-stone-400 mb-0.5 ml-1">{msg.userName}</Text>}
                  {editingId === msg.id ? (
                    <View className="flex-row items-center gap-2">
                      <TextInput
                        className="flex-1 border border-blue-400 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        value={editText} onChangeText={setEditText} autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSaveEdit(msg.id)} className="bg-blue-600 p-2 rounded-lg">
                        <FontAwesome name="check" size={12} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingId(null); setEditText(''); }} className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
                        <FontAwesome name="times" size={12} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className={`rounded-xl px-3 py-2 ${isOwn ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Text className={`text-sm ${isOwn ? 'text-white' : 'text-gray-900 dark:text-stone-200'}`}>{msg.message}</Text>
                      <View className="flex-row items-center justify-end gap-1 mt-0.5">
                        <Text className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-stone-500'}`}>{formatTime(msg.createdAt)}</Text>
                        {msg.edited && <Text className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-stone-500'}`}>(edited)</Text>}
                      </View>
                    </View>
                  )}
                  {isOwn && editingId !== msg.id && (
                    <View className="flex-row gap-2 justify-end mt-0.5 mr-1">
                      <TouchableOpacity onPress={() => handleEdit(msg)}>
                        <Text className="text-xs text-gray-500 dark:text-stone-500">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(msg.id)}>
                        <Text className="text-xs text-red-500">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          <View className="h-4" />
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-end px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <TextInput
            className="flex-1 border border-gray-300 dark:border-stone-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm mr-2 max-h-28"
            value={messageText} onChangeText={setMessageText}
            placeholder="Message..." placeholderTextColor="#9ca3af" multiline
          />
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${!messageText.trim() || sending ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleSend} disabled={!messageText.trim() || sending}
          >
            <FontAwesome name="send" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
