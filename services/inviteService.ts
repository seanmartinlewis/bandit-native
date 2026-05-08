import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Invite, BandRole } from '../types/firestore';

export async function createInvite(
  bandId: string,
  bandName: string,
  email: string,
  role: BandRole,
): Promise<string> {
  const inviteDoc = await addDoc(collection(db, 'invites'), {
    bandId,
    bandName,
    email: email.toLowerCase(),
    role,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return inviteDoc.id;
}

export async function getInvitesForBand(bandId: string): Promise<Invite[]> {
  const q = query(collection(db, 'invites'), where('bandId', '==', bandId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getInvitesForEmail(email: string): Promise<Invite[]> {
  const q = query(
    collection(db, 'invites'),
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function revokeInvite(inviteId: string): Promise<void> {
  await deleteDoc(doc(db, 'invites', inviteId));
}

export async function deleteInvite(inviteId: string): Promise<void> {
  await deleteDoc(doc(db, 'invites', inviteId));
}

export async function acceptInvite(inviteId: string): Promise<void> {
  await deleteDoc(doc(db, 'invites', inviteId));
}
