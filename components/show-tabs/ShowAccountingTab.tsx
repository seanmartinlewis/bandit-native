import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import {
  getShowAccounting,
  updateShowAccounting,
  createEmptyAccounting,
} from '@/services/showAccountingService';
import type { ShowAccounting } from '@/types/firestore';

interface Props { showId: string }

function numOrZero(v: string) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

export default function ShowAccountingTab({ showId }: Props) {
  const [accounting, setAccounting] = useState<ShowAccounting>(createEmptyAccounting());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formRevenue, setFormRevenue] = useState({ settlement: '', buyout: '', merchCash: '', merchDigital: '' });
  const [formExpenses, setFormExpenses] = useState({ supportPayout: '', bookingCut: '', merchCut: '', lodging: '', gas: '', food: '', misc: '' });
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => { load(); }, [showId]);

  async function load() {
    try {
      const data = await getShowAccounting(showId);
      if (data) {
        setAccounting(data);
        setFormRevenue({ settlement: String(data.revenue.settlement || ''), buyout: String(data.revenue.buyout || ''), merchCash: String(data.revenue.merchCash || ''), merchDigital: String(data.revenue.merchDigital || '') });
        setFormExpenses({ supportPayout: String(data.expenses.supportPayout || ''), bookingCut: String(data.expenses.bookingCut || ''), merchCut: String(data.expenses.merchCut || ''), lodging: String(data.expenses.lodging || ''), gas: String(data.expenses.gas || ''), food: String(data.expenses.food || ''), misc: String(data.expenses.misc || '') });
        setFormNotes(data.notes || '');
      }
    } catch {
      Alert.alert('Error', 'Failed to load accounting');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated: ShowAccounting = {
        revenue: { settlement: numOrZero(formRevenue.settlement), buyout: numOrZero(formRevenue.buyout), merchCash: numOrZero(formRevenue.merchCash), merchDigital: numOrZero(formRevenue.merchDigital) },
        expenses: { supportPayout: numOrZero(formExpenses.supportPayout), bookingCut: numOrZero(formExpenses.bookingCut), merchCut: numOrZero(formExpenses.merchCut), lodging: numOrZero(formExpenses.lodging), gas: numOrZero(formExpenses.gas), food: numOrZero(formExpenses.food), misc: numOrZero(formExpenses.misc) },
        notes: formNotes,
      };
      await updateShowAccounting(showId, updated);
      setAccounting(updated);
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save accounting');
    } finally {
      setSaving(false);
    }
  }

  const totalRevenue = Object.values(accounting.revenue).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(accounting.expenses).reduce((a, b) => a + b, 0);
  const netProfit = totalRevenue - totalExpenses;

  const Field = ({ label, value, field, section }: { label: string; value: string; field: string; section: 'revenue' | 'expenses' }) => (
    <View className="flex-row items-center mb-2">
      <Text className="flex-1 text-sm text-gray-600 dark:text-stone-400">{label}</Text>
      {editing ? (
        <TextInput
          className="w-28 text-right border border-gray-300 dark:border-stone-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          value={section === 'revenue' ? (formRevenue as any)[field] : (formExpenses as any)[field]}
          onChangeText={(v) => section === 'revenue' ? setFormRevenue((f) => ({ ...f, [field]: v })) : setFormExpenses((f) => ({ ...f, [field]: v }))}
          keyboardType="decimal-pad" placeholder="0"  placeholderTextColor="#9ca3af"
        />
      ) : (
        <Text className="text-sm font-medium text-gray-900 dark:text-white">
          ${section === 'revenue' ? (accounting.revenue as any)[field] : (accounting.expenses as any)[field]}
        </Text>
      )}
    </View>
  );

  if (loading) return <Text className="text-center text-gray-500 py-8">Loading...</Text>;

  return (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-gray-900 dark:text-white">Accounting</Text>
        {editing ? (
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => { setEditing(false); load(); }} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Text className="text-sm text-gray-700 dark:text-stone-300">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving} className="px-3 py-1 bg-blue-600 rounded-lg">
              <Text className="text-sm text-white">{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Text className="text-sm text-gray-700 dark:text-stone-300">Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Text className="text-xs text-gray-500 dark:text-stone-500">Revenue</Text>
          <Text className="text-lg font-bold text-green-700 dark:text-green-400">${totalRevenue}</Text>
        </View>
        <View className="flex-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <Text className="text-xs text-gray-500 dark:text-stone-500">Expenses</Text>
          <Text className="text-lg font-bold text-red-700 dark:text-red-400">${totalExpenses}</Text>
        </View>
        <View className={`flex-1 p-3 ${netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'} rounded-lg border`}>
          <Text className="text-xs text-gray-500 dark:text-stone-500">Net</Text>
          <Text className={`text-lg font-bold ${netProfit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>${netProfit}</Text>
        </View>
      </View>

      <Text className="font-semibold text-gray-900 dark:text-white mb-2">Revenue</Text>
      <View className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
        <Field label="Settlement" value="" field="settlement" section="revenue" />
        <Field label="Buyout" value="" field="buyout" section="revenue" />
        <Field label="Merch (Cash)" value="" field="merchCash" section="revenue" />
        <Field label="Merch (Digital)" value="" field="merchDigital" section="revenue" />
      </View>

      <Text className="font-semibold text-gray-900 dark:text-white mb-2">Expenses</Text>
      <View className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
        <Field label="Support Payout" value="" field="supportPayout" section="expenses" />
        <Field label="Booking Cut" value="" field="bookingCut" section="expenses" />
        <Field label="Merch Cut" value="" field="merchCut" section="expenses" />
        <Field label="Lodging" value="" field="lodging" section="expenses" />
        <Field label="Gas" value="" field="gas" section="expenses" />
        <Field label="Food" value="" field="food" section="expenses" />
        <Field label="Misc" value="" field="misc" section="expenses" />
      </View>

      <Text className="font-semibold text-gray-900 dark:text-white mb-2">Notes</Text>
      {editing ? (
        <TextInput
          className="border border-gray-300 dark:border-stone-700 rounded-lg px-3 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-h-[80px]"
          value={formNotes} onChangeText={setFormNotes} multiline textAlignVertical="top" placeholder="Accounting notes..." placeholderTextColor="#9ca3af"
        />
      ) : (
        <Text className="text-sm text-gray-700 dark:text-stone-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{accounting.notes || 'No notes'}</Text>
      )}
    </View>
  );
}
