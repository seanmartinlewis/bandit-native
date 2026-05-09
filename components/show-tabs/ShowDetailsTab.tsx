import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import type { Show } from '@/types/firestore';
import { updateShow } from '@/services/showService';
import { useBandStore } from '@/store/bandStore';

interface Props { show: Show | null; onUpdated: () => void }

export default function ShowDetailsTab({ show, onUpdated }: Props) {
  const { currentRole } = useBandStore();
  const canEdit = ['admin', 'edit'].includes(currentRole || '');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    venue: show?.venue || '',
    city: show?.city || '',
    state: show?.state || '',
    address: show?.address || '',
    phone: show?.phone || '',
    capacity: String(show?.capacity || ''),
    buyout: String(show?.buyout || ''),
    ticketLink: show?.ticketLink || '',
    notes: show?.notes || '',
  });

  async function save() {
    if (!show) return;
    try {
      await updateShow(show.id, {
        venue: form.venue,
        city: form.city,
        state: form.state,
        address: form.address,
        phone: form.phone,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        buyout: form.buyout ? Number(form.buyout) : undefined,
        ticketLink: form.ticketLink,
      });
      await onUpdated();
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    }
  }

  const Field = ({ label, value, field, keyboard }: { label: string; value: string; field: keyof typeof form; keyboard?: any }) => (
    <View className="mb-3">
      <Text className="text-xs font-redhat-semibold text-gray-500 dark:text-stone-500 uppercase mb-1">{label}</Text>
      {editing ? (
        <TextInput
          className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-2 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-orange-100 text-sm"
          value={form[field]}
          onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
          keyboardType={keyboard || 'default'}
          placeholderTextColor="#9ca3af"
        />
      ) : (
        <Text className="text-gray-800 dark:text-stone-200 text-sm">{value || '—'}</Text>
      )}
    </View>
  );

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-redhat-semibold text-gray-900 dark:text-orange-100">Show Details</Text>
        {canEdit && (
          editing
            ? <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => setEditing(false)} className="px-3 py-1 bg-gray-100 dark:bg-charcoal-700 rounded-lg">
                  <Text className="text-sm text-gray-700 dark:text-stone-300">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={save} className="px-3 py-1 bg-bandit-primary dark:bg-bandit-primaryDark rounded-lg">
                  <Text className="text-sm text-white">Save</Text>
                </TouchableOpacity>
              </View>
            : <TouchableOpacity onPress={() => setEditing(true)} className="px-3 py-1 bg-gray-100 dark:bg-charcoal-700 rounded-lg">
                <Text className="text-sm text-gray-700 dark:text-stone-300">Edit</Text>
              </TouchableOpacity>
        )}
      </View>
      <Field label="Venue" value={show?.venue || ''} field="venue" />
      <Field label="City" value={show?.city || ''} field="city" />
      <Field label="State" value={show?.state || ''} field="state" />
      <Field label="Address" value={show?.address || ''} field="address" />
      <Field label="Phone" value={show?.phone || ''} field="phone" keyboard="phone-pad" />
      <Field label="Capacity" value={show?.capacity?.toString() || ''} field="capacity" keyboard="number-pad" />
      <Field label="Buyout ($)" value={show?.buyout?.toString() || ''} field="buyout" keyboard="decimal-pad" />
      <Field label="Ticket Link" value={show?.ticketLink || ''} field="ticketLink" keyboard="url" />
    </View>
  );
}
