import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useBandStore } from '@/store/bandStore';
import { db } from '@/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import type { BandDocument } from '@/types/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return 'file-pdf-o';
  if (type.includes('image')) return 'file-image-o';
  if (type.includes('word') || type.includes('doc')) return 'file-word-o';
  if (type.includes('sheet') || type.includes('excel')) return 'file-excel-o';
  return 'file-o';
}

export default function DocumentsScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const bandStore = useBandStore();
  const [documents, setDocuments] = useState<BandDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const canEdit = ['admin', 'edit'].includes(bandStore.currentRole || '');

  useEffect(() => { loadDocuments(); }, [bandId]);

  async function loadDocuments() {
    setLoading(true);
    try {
      const q = query(collection(db, 'bandDocuments'), where('bandId', '==', bandId));
      const snap = await getDocs(q);
      const docs: BandDocument[] = snap.docs.map((d) => ({
        id: d.id, ...(d.data() as any),
        uploadedAt: d.data().uploadedAt?.toDate() || new Date(),
      }));
      setDocuments(docs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    } catch {
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(docId: string, docName: string) {
    Alert.alert('Delete Document?', `Delete "${docName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'bandDocuments', docId));
            await loadDocuments();
          } catch {
            Alert.alert('Error', 'Failed to delete document');
          }
        },
      },
    ]);
  }

  async function handleOpen(fileUrl: string) {
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file URL');
      }
    } catch {
      Alert.alert('Error', 'Failed to open file');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <AppHeader bandId={bandId} />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-orange-100">Documents</Text>
          <Text className="text-sm text-gray-500 dark:text-stone-500">Upload via web app</Text>
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : documents.length === 0 ? (
          <View className="py-12 items-center">
            <FontAwesome name="folder-open-o" size={40} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-stone-500 text-sm mt-3 text-center">
              No documents uploaded yet.{'\n'}Upload documents from the web app.
            </Text>
          </View>
        ) : (
          documents.map((docItem) => (
            <View key={docItem.id} className="flex-row items-center p-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-stone-700">
              <View className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                <FontAwesome name={getFileIcon(docItem.fileType) as any} size={20} color="#2563eb" />
              </View>
              <TouchableOpacity className="flex-1 min-w-0" onPress={() => handleOpen(docItem.fileUrl)}>
                <Text className="text-sm font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                  {docItem.name || docItem.fileName}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-stone-500">
                  {formatFileSize(docItem.fileSize)} · {docItem.uploadedAt.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {canEdit && (
                <TouchableOpacity onPress={() => handleDelete(docItem.id, docItem.name || docItem.fileName)} className="p-2 ml-1">
                  <FontAwesome name="trash-o" size={16} color="#dc2626" />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
