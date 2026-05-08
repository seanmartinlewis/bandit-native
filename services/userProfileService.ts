import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile, MediaLink } from '../types/firestore';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as UserProfile;
}

export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string,
): Promise<void> {
  await setDoc(doc(db, 'users', userId), {
    email,
    displayName: displayName || email.split('@')[0],
    bio: '',
    website: '',
    phone: '',
    showPhone: false,
    profilePictureUrl: '',
    isPublic: false,
    instruments: [],
    mediaLinks: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function updateLastViewedBandId(
  userId: string,
  bandId: string | null,
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    lastViewedBandId: bandId ?? '',
    updatedAt: serverTimestamp(),
  });
}

export async function addMediaLink(
  userId: string,
  link: Omit<MediaLink, 'id' | 'order'>,
): Promise<void> {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('Profile not found');
  const newLink: MediaLink = {
    ...link,
    id: Date.now().toString(),
    order: profile.mediaLinks.length,
  };
  await updateUserProfile(userId, { mediaLinks: [...profile.mediaLinks, newLink] });
}

export async function updateMediaLink(
  userId: string,
  linkId: string,
  updates: Partial<Omit<MediaLink, 'id'>>,
): Promise<void> {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('Profile not found');
  const updatedLinks = profile.mediaLinks.map((link) =>
    link.id === linkId ? { ...link, ...updates } : link,
  );
  await updateUserProfile(userId, { mediaLinks: updatedLinks });
}

export async function deleteMediaLink(userId: string, linkId: string): Promise<void> {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('Profile not found');
  const updatedLinks = profile.mediaLinks
    .filter((link) => link.id !== linkId)
    .map((link, index) => ({ ...link, order: index }));
  await updateUserProfile(userId, { mediaLinks: updatedLinks });
}
