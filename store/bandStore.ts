import { create } from 'zustand';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Band, BandRole, UserProfile } from '../types/firestore';

interface BandState {
  currentBand: Band | null;
  currentRole: BandRole | null;
  loading: boolean;
  userBands: Band[];
  userBandsLoaded: boolean;
  userProfile: UserProfile | null;
  userProfileLoaded: boolean;
  lastViewedBandId: string | null;

  loadBand: (bandId: string) => Promise<void>;
  loadUserBands: () => Promise<void>;
  refreshUserBands: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  setLastViewedBandId: (bandId: string | null) => Promise<void>;
  reset: () => void;
}

export const useBandStore = create<BandState>((set, get) => ({
  currentBand: null,
  currentRole: null,
  loading: false,
  userBands: [],
  userBandsLoaded: false,
  userProfile: null,
  userProfileLoaded: false,
  lastViewedBandId: null,

  loadBand: async (bandId: string) => {
    set({ loading: true });
    try {
      const snap = await getDoc(doc(db, 'bands', bandId));
      if (!snap.exists()) {
        set({ loading: false });
        throw new Error('Band not found');
      }
      const band = { id: snap.id, ...snap.data() } as Band;
      const uid = auth.currentUser?.uid;
      const role = uid ? (band.members?.[uid]?.role ?? null) : null;

      set({ currentBand: band, currentRole: role, loading: false, lastViewedBandId: bandId });
      if (uid) {
        const { updateLastViewedBandId } = await import('../services/userProfileService');
        await updateLastViewedBandId(uid, bandId);
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  loadUserBands: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || get().userBandsLoaded) return;
    try {
      const { getBandsForUser } = await import('../services/bandService');
      const bands = await getBandsForUser(userId);
      set({ userBands: bands, userBandsLoaded: true });
    } catch (error) {
      console.error('Error loading user bands:', error);
    }
  },

  refreshUserBands: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const { getBandsForUser } = await import('../services/bandService');
      const bands = await getBandsForUser(userId);
      set({ userBands: bands });
    } catch (error) {
      console.error('Error refreshing user bands:', error);
    }
  },

  loadUserProfile: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || get().userProfileLoaded) return;
    try {
      const { getUserProfile } = await import('../services/userProfileService');
      const profile = await getUserProfile(userId);
      set({
        userProfile: profile,
        userProfileLoaded: true,
        lastViewedBandId: profile?.lastViewedBandId || get().lastViewedBandId,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  },

  refreshUserProfile: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const { getUserProfile } = await import('../services/userProfileService');
      const profile = await getUserProfile(userId);
      set({
        userProfile: profile,
        lastViewedBandId: profile?.lastViewedBandId || get().lastViewedBandId,
      });
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  },

  setLastViewedBandId: async (bandId: string | null) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const { updateLastViewedBandId } = await import('../services/userProfileService');
      await updateLastViewedBandId(userId, bandId);
    }
    set({ lastViewedBandId: bandId });
  },

  reset: () => {
    const lastViewedBandId = get().lastViewedBandId;
    set({
      currentBand: null,
      currentRole: null,
      loading: false,
      userBands: [],
      userBandsLoaded: false,
      userProfile: null,
      userProfileLoaded: false,
      lastViewedBandId,
    });
  },
}));
