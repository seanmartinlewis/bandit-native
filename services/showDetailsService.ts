import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  PromoterDetails,
  GuestListEntry,
  ShowContact,
  SetListSong,
  ScheduleEvent,
} from '../types/firestore';

export async function updatePromoterDetails(showId: string, promoter: PromoterDetails): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { promoter, updatedAt: serverTimestamp() });
}

export async function addGuestListEntry(showId: string, entry: GuestListEntry): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { guestList: arrayUnion(entry), updatedAt: serverTimestamp() });
}

export async function removeGuestListEntry(showId: string, entry: GuestListEntry): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { guestList: arrayRemove(entry), updatedAt: serverTimestamp() });
}

export async function updateGuestListEntry(
  showId: string,
  oldEntry: GuestListEntry,
  newEntry: GuestListEntry,
): Promise<void> {
  const showSnap = await getDoc(doc(db, 'shows', showId));
  if (!showSnap.exists()) throw new Error('Show not found');
  const guestList = showSnap.data().guestList || [];
  const updatedList = guestList.map((g: GuestListEntry) => (g.id === oldEntry.id ? newEntry : g));
  await updateDoc(doc(db, 'shows', showId), { guestList: updatedList, updatedAt: serverTimestamp() });
}

export async function addShowContact(showId: string, contact: ShowContact): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { contacts: arrayUnion(contact), updatedAt: serverTimestamp() });
}

export async function removeShowContact(showId: string, contact: ShowContact): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { contacts: arrayRemove(contact), updatedAt: serverTimestamp() });
}

export async function updateShowContact(showId: string, oldContact: ShowContact, newContact: ShowContact): Promise<void> {
  const showSnap = await getDoc(doc(db, 'shows', showId));
  if (!showSnap.exists()) throw new Error('Show not found');
  const contacts = showSnap.data().contacts || [];
  const updatedContacts = contacts.map((c: ShowContact) => (c.id === oldContact.id ? newContact : c));
  await updateDoc(doc(db, 'shows', showId), { contacts: updatedContacts, updatedAt: serverTimestamp() });
}

export async function addSetListSong(showId: string, song: SetListSong): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { setList: arrayUnion(song), updatedAt: serverTimestamp() });
}

export async function removeSetListSong(showId: string, song: SetListSong): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { setList: arrayRemove(song), updatedAt: serverTimestamp() });
}

export async function updateSetListOrder(showId: string, setList: SetListSong[]): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { setList, updatedAt: serverTimestamp() });
}

export async function addScheduleEvent(showId: string, event: ScheduleEvent): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { 'schedule.events': arrayUnion(event), updatedAt: serverTimestamp() });
}

export async function removeScheduleEvent(showId: string, event: ScheduleEvent): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { 'schedule.events': arrayRemove(event), updatedAt: serverTimestamp() });
}

export async function updateScheduleEvents(showId: string, events: ScheduleEvent[]): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { 'schedule.events': events, updatedAt: serverTimestamp() });
}

export async function updateShowNotes(showId: string, notes: string): Promise<void> {
  await updateDoc(doc(db, 'shows', showId), { notes, updatedAt: serverTimestamp() });
}
