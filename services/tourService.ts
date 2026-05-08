import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Tour } from '../types/firestore';

export async function getToursForBand(bandId: string): Promise<Tour[]> {
  const q = query(collection(db, 'tours'), where('bandId', '==', bandId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      bandId: data.bandId,
      name: data.name,
      description: data.description,
      posterUrl: data.posterUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: data.createdAt?.toDate() || new Date(),
      createdBy: data.createdBy,
      updatedAt: data.updatedAt?.toDate(),
    } as Tour;
  });
}

export async function createTour(
  bandId: string,
  name: string,
  startDate: string,
  endDate: string,
  userId: string,
  description?: string,
): Promise<string> {
  const tourData: any = {
    bandId,
    name,
    startDate,
    endDate,
    createdAt: serverTimestamp(),
    createdBy: userId,
  };
  if (description) tourData.description = description;
  const docRef = await addDoc(collection(db, 'tours'), tourData);
  return docRef.id;
}

export async function updateTour(
  tourId: string,
  updates: { name?: string; description?: string; startDate?: string; endDate?: string },
): Promise<void> {
  await updateDoc(doc(db, 'tours', tourId), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteTour(tourId: string): Promise<void> {
  await deleteDoc(doc(db, 'tours', tourId));
}
