import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { ShowAccounting } from '../types/firestore';

export async function getShowAccounting(showId: string): Promise<ShowAccounting | null> {
  const accountingSnap = await getDoc(doc(db, 'showAccounting', showId));
  if (!accountingSnap.exists()) return null;
  return accountingSnap.data() as ShowAccounting;
}

export async function updateShowAccounting(showId: string, accounting: ShowAccounting): Promise<void> {
  const accountingRef = doc(db, 'showAccounting', showId);
  const accountingSnap = await getDoc(accountingRef);
  if (accountingSnap.exists()) {
    await updateDoc(accountingRef, accounting as any);
  } else {
    await setDoc(accountingRef, accounting);
  }
}

export function createEmptyAccounting(): ShowAccounting {
  return {
    revenue: { settlement: 0, buyout: 0, merchCash: 0, merchDigital: 0 },
    expenses: { supportPayout: 0, bookingCut: 0, merchCut: 0, lodging: 0, gas: 0, food: 0, misc: 0 },
    notes: '',
  };
}
