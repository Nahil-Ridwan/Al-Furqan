import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { doc, setDoc } from 'firebase/firestore';
import { AppState, AppStateStatus } from 'react-native';
import { studentsRef } from './helpers';
import { Entry } from './typeEntry';

export const PENDING_MUTATIONS_KEY = 'pending_mutations';


// ---- Offline Mutation Queue (Outbox Pattern) ----
type PendingMutation = {
  id: string;
  type: 'UPSERT' | 'DELETE';
  entry?: Entry;
  timestamp: number;
};

const getPendingMutations = async (): Promise<PendingMutation[]> => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_MUTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const savePendingMutations = async (mutations: PendingMutation[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(mutations));
  } catch (err) {
    console.error('Failed to save pending mutations:', err);
  }
};

export const addPendingMutation = async (id: string, type: 'UPSERT' | 'DELETE', entry?: Entry): Promise<void> => {
  const mutations = await getPendingMutations();
  const filtered = mutations.filter((m) => m.id !== id);
  filtered.push({
    id,
    type,
    entry,
    timestamp: Date.now(),
  });
  await savePendingMutations(filtered);
};

const removePendingMutation = async (id: string): Promise<void> => {
  const mutations = await getPendingMutations();
  const filtered = mutations.filter((m) => m.id !== id);
  await savePendingMutations(filtered);
};

export const addPendingMutations = async (
  newMutations: { id: string; type: 'UPSERT' | 'DELETE'; entry?: Entry }[],
): Promise<void> => {
  const mutations = await getPendingMutations();
  const idsToFilter = new Set(newMutations.map((m) => m.id));
  const filtered = mutations.filter((m) => !idsToFilter.has(m.id));
  
  const timestamp = Date.now();
  newMutations.forEach((m) => {
    filtered.push({
      ...m,
      timestamp,
    });
  });
  await savePendingMutations(filtered);
};

export const removePendingMutations = async (ids: string[]): Promise<void> => {
  const mutations = await getPendingMutations();
  const idsToRemove = new Set(ids);
  const filtered = mutations.filter((m) => !idsToRemove.has(m.id));
  await savePendingMutations(filtered);
};

const timeoutPromise = <T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out'): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

let isSyncingMutations = false;
let syncRetryCount = 0;
const MAX_SYNC_RETRIES = 3;

export const syncPendingMutations = async (): Promise<void> => {
  if (isSyncingMutations) return;
  isSyncingMutations = true;

  // Pre-flight check: do not run sync if NetInfo reports we are offline/unreachable
  try {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || netState.isInternetReachable === false) {
      isSyncingMutations = false;
      return;
    }
  } catch (err) {
    console.warn('Failed to fetch NetInfo state during pre-flight sync check, proceeding anyway:', err);
  }

  let hasFailed = false;

  try {
    const mutations = await getPendingMutations();
    if (mutations.length === 0) {
      syncRetryCount = 0;
      isSyncingMutations = false;
      return;
    }

    console.log(`Processing ${mutations.length} pending offline mutations...`);

    for (const mutation of mutations) {
      try {
        if (mutation.type === 'UPSERT') {
          if (mutation.entry) {
            await timeoutPromise(
              setDoc(doc(studentsRef, mutation.id), mutation.entry),
              10000,
              `Firestore setDoc timeout for ${mutation.id}`
            );
          }
        } else if (mutation.type === 'DELETE') {
          await timeoutPromise(
            setDoc(doc(studentsRef, mutation.id), { id: mutation.id, deleted: true, updatedAt: new Date().toISOString() }),
            10000,
            `Firestore delete setDoc timeout for ${mutation.id}`
          );
        }
        await removePendingMutation(mutation.id);
        console.log(`Successfully synced mutation for ${mutation.id}`);
        // Reset retry count upon a successful write
        syncRetryCount = 0;
      } catch (err) {
        console.error(`Failed to sync mutation for ${mutation.id}:`, err);
        hasFailed = true;
        break; // Stop loop if offline or error occurs
      }
    }

    // Schedule a retry if the sync failed and we have remaining mutations,
    // provided we are online and haven't exceeded retry limits.
    if (hasFailed) {
      const remaining = await getPendingMutations();
      if (remaining.length > 0 && syncRetryCount < MAX_SYNC_RETRIES) {
        const state = await NetInfo.fetch();
        if (state.isConnected && state.isInternetReachable !== false) {
          syncRetryCount++;
          console.log(`Scheduling sync retry #${syncRetryCount} in 5000ms...`);
          setTimeout(() => {
            syncPendingMutations().catch((err) =>
              console.error('Scheduled sync retry failed:', err)
            );
          }, 5000);
        }
      }
    }
  } finally {
    isSyncingMutations = false;
  }
};

// Listen to network connectivity shifts to auto-sync pending updates when we go online
NetInfo.addEventListener((state) => {
  if (state.isConnected && state.isInternetReachable) {
    syncRetryCount = 0; // Reset retry count when transition to online occurs
    syncPendingMutations().catch((err) =>
      console.error('NetInfo triggered sync failed:', err)
    );
  }
});

// Listen to AppState changes (foregrounding) to trigger sync
AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    syncRetryCount = 0; // Reset retry count when app foregrounds
    syncPendingMutations().catch((err) =>
      console.error('AppState foreground sync failed:', err)
    );
  }
});