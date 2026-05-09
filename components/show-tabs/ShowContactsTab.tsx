import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import type { Show, ShowContact } from '@/types/firestore';
import { addShowContact, removeShowContact } from '@/services/showDetailsService';
import { useBandStore } from '@/store/bandStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Props { show: Show | null; onUpdated: () => void }

function newContact(): Omit<ShowContact, 'id'> { return { name: '', phone: '', email: '', title: '' }; }

export default function ShowContactsTab({ show, onUpdated }: Props) {
  const { currentRole } = useBandStore();
  const canEdit = ['admin', 'edit'].includes(currentRole || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(newContact());
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!show || !form.name || !form.phone) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      const contact: ShowContact = { ...form, id: Date.now().toString() };
      await addShowContact(show.id, contact);
      await onUpdated();
      setModalOpen(false);
      setForm(newContact());
    } catch {
      Alert.alert('Error', 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(contact: ShowContact) {
    if (!show) return;
    Alert.alert('Remove Contact?', `Remove ${contact.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await removeShowContact(show.id, contact);
            await onUpdated();
          } catch {
            Alert.alert('Error', 'Failed to remove contact');
          }
        },
      },
    ]);
  }

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-redhat-semibold text-gray-900 dark:text-orange-100">Contacts</Text>
        {canEdit && (
          <TouchableOpacity onPress={() => setModalOpen(true)} className="flex-row items-center gap-1 px-3 py-1 bg-bandit-primary dark:bg-bandit-primaryDark rounded-lg">
            <FontAwesome name="plus" size={12} color="white" />
            <Text className="text-white text-sm">Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {(show?.contacts || []).length === 0 ? (
        <Text className="text-gray-500 dark:text-stone-500 text-sm text-center py-4">No contacts added yet</Text>
      ) : (
        (show?.contacts || []).map((contact) => (
          <View key={contact.id} className="flex-row items-start justify-between p-3 mb-2 bg-gray-50 dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-stone-700">
            <View className="flex-1">
              <Text className="font-redhat-medium text-gray-900 dark:text-orange-100 text-sm">{contact.name}</Text>
              {contact.title && <Text className="text-xs text-bandit-primary dark:text-bandit-primarySoft">{contact.title}</Text>}
              <Text className="text-xs text-gray-600 dark:text-stone-400">{contact.phone}</Text>
              {contact.email && <Text className="text-xs text-gray-600 dark:text-stone-400">{contact.email}</Text>}
            </View>
            {canEdit && (
              <TouchableOpacity onPress={() => handleRemove(contact)} className="p-1">
                <FontAwesome name="trash-o" size={14} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      <Modal visible={modalOpen} animationType="slide" transparent presentationStyle="overFullScreen">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white dark:bg-charcoal-900 rounded-t-2xl p-6">
            <Text className="font-redhat-semibold text-xl text-gray-900 dark:text-orange-100 mb-4">Add Contact</Text>
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Name *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Contact name" placeholderTextColor="#9ca3af" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Title</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="e.g. Promoter, Stage Manager" placeholderTextColor="#9ca3af" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Phone *</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="Phone number" placeholderTextColor="#9ca3af" keyboardType="phone-pad" />
            <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">Email</Text>
            <TextInput className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2.5 mb-4 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="Email address" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-charcoal-700 py-3 rounded-lg items-center" onPress={() => { setModalOpen(false); setForm(newContact()); }}>
                <Text className="text-gray-700 dark:text-stone-300 font-redhat-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-bandit-primary dark:bg-bandit-primaryDark py-3 rounded-lg items-center" onPress={handleAdd} disabled={saving}>
                <Text className="text-white font-redhat-medium">{saving ? 'Adding...' : 'Add Contact'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
