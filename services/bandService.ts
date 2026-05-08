import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Band, BandRole } from '../types/firestore';

export async function createBand(name: string, userId: string): Promise<string> {
  const bandRef = await addDoc(collection(db, 'bands'), {
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
    members: { [userId]: { role: 'admin' } },
  });
  return bandRef.id;
}

export async function getBand(bandId: string): Promise<Band | null> {
  const bandSnap = await getDoc(doc(db, 'bands', bandId));
  if (!bandSnap.exists()) return null;
  return { id: bandSnap.id, ...bandSnap.data() } as Band;
}

export async function addMember(bandId: string, userId: string, role: BandRole) {
  await updateDoc(doc(db, 'bands', bandId), {
    [`members.${userId}`]: { role },
  });
}

export async function updateMemberRole(bandId: string, userId: string, newRole: BandRole) {
  await updateDoc(doc(db, 'bands', bandId), {
    [`members.${userId}.role`]: newRole,
  });
}

export async function updateMemberTitle(
  bandId: string,
  userId: string,
  newTitle: string | undefined,
) {
  if (newTitle === undefined) {
    await updateDoc(doc(db, 'bands', bandId), {
      [`members.${userId}.title`]: deleteField(),
    });
  } else {
    await updateDoc(doc(db, 'bands', bandId), {
      [`members.${userId}.title`]: newTitle,
    });
  }
}

export async function removeMember(bandId: string, userId: string) {
  await updateDoc(doc(db, 'bands', bandId), {
    [`members.${userId}`]: deleteField(),
  });
}

export async function getBandsForUser(userId: string): Promise<Band[]> {
  const q = query(collection(db, 'bands'), where(`members.${userId}`, '!=', null));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Band[];
}

export async function updateBandProfile(
  bandId: string,
  updates: Partial<Pick<Band, 'bio' | 'profilePictureUrl' | 'mediaLinks' | 'name' | 'status'>>,
): Promise<void> {
  await updateDoc(doc(db, 'bands', bandId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBand(bandId: string): Promise<void> {
  await deleteDoc(doc(db, 'bands', bandId));
}
