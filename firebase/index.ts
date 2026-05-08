import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

function getAsyncStoragePersistence(storage: ReturnType<typeof createAsyncStorage>): Persistence {
  return class {
    static type = 'LOCAL';
    readonly type = 'LOCAL';

    async _isAvailable() {
      try {
        await storage.setItem('__bandit_auth_storage_test__', '1');
        await storage.removeItem('__bandit_auth_storage_test__');
        return true;
      } catch {
        return false;
      }
    }

    _set(key: string, value: unknown) {
      return storage.setItem(key, JSON.stringify(value));
    }

    async _get<T>(key: string) {
      const value = await storage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    }

    _remove(key: string) {
      return storage.removeItem(key);
    }

    _addListener() {
      return undefined;
    }

    _removeListener() {
      return undefined;
    }
  } as unknown as Persistence;
}

// Initialize auth with AsyncStorage persistence (only once)
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getAsyncStoragePersistence(createAsyncStorage('bandit-auth')),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
