import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { BandMessage } from '../types/firestore';

export async function sendMessage(
  bandId: string,
  userId: string,
  userName: string,
  userPhotoUrl: string | undefined,
  message: string,
): Promise<string> {
  const docRef = await addDoc(collection(db, 'bandMessages'), {
    bandId,
    userId,
    userName,
    userPhotoUrl: userPhotoUrl || null,
    message,
    createdAt: Timestamp.now(),
    edited: false,
  });
  return docRef.id;
}

export async function updateMessage(messageId: string, newMessage: string): Promise<void> {
  await updateDoc(doc(db, 'bandMessages', messageId), {
    message: newMessage,
    updatedAt: Timestamp.now(),
    edited: true,
  });
}

export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, 'bandMessages', messageId));
}

export function subscribeToMessages(
  bandId: string,
  callback: (messages: BandMessage[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'bandMessages'),
    where('bandId', '==', bandId),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snapshot) => {
    const messages: BandMessage[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        bandId: data.bandId,
        userId: data.userId,
        userName: data.userName,
        userPhotoUrl: data.userPhotoUrl,
        message: data.message,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        edited: data.edited || false,
      };
    });
    callback(messages);
  });
}
