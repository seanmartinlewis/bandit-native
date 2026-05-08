import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Show, ShowSchedule } from '../types/firestore';

export async function createShow(
  bandId: string,
  data: {
    date: string;
    venue: string;
    city: string;
    state: string;
    address?: string;
    phone?: string;
    schedule?: ShowSchedule;
    createdBy: string;
    isTravelDay?: boolean;
  },
): Promise<string> {
  const showDoc = await addDoc(collection(db, 'shows'), {
    bandId,
    date: data.date,
    venue: data.venue,
    city: data.city,
    state: data.state,
    address: data.address ?? '',
    phone: data.phone ?? '',
    schedule: data.schedule ?? { events: [] },
    createdAt: serverTimestamp(),
    createdBy: data.createdBy,
    guestList: [],
    contacts: [],
    setList: [],
    documents: [],
    isTravelDay: data.isTravelDay ?? false,
  });
  return showDoc.id;
}

export async function getShowsForBand(bandId: string): Promise<Show[]> {
  const q = query(collection(db, 'shows'), where('bandId', '==', bandId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function updateShow(showId: string, update: Partial<Show>) {
  await updateDoc(doc(db, 'shows', showId), update as any);
}

export async function deleteShow(showId: string) {
  await deleteDoc(doc(db, 'shows', showId));
}
