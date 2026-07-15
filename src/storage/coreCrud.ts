import AsyncStorage from '@react-native-async-storage/async-storage';
import { writeBatch } from 'firebase/firestore';
import { CACHE_KEY, readCache, removeCacheEntry, updateCacheEntry } from './cacheService';
import { db } from './firebaseConfig';
import { studentsRef } from './helpers';
import { addPendingMutation, PENDING_MUTATIONS_KEY, syncPendingMutations } from './offlineMutation';
import { LAST_SYNC_KEY, notifySubscribers } from './subscription';
import { Entry } from './typeEntry';

const STUDENTS_KEY = 'students';

export async function getEntryById(id: string): Promise<Entry | null> {
  const entries = await readCache();
  if (!entries) return null;
  return entries.find(entry => entry.id === id) ?? null;
}


export const saveEntries = async (entries: Entry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(entries));
    console.log(`Saved ${entries.length} entries`);
  } catch (error) {
    console.error('Error saving entries:', error);
    throw error;
  }
};


export const deleteEntry = async (id: string): Promise<void> => {
  // Remove from cache immediately.
  await removeCacheEntry(id);
  const cached = await readCache();
  notifySubscribers(cached);

  // Add to pending mutations queue
  await addPendingMutation(id, 'DELETE');

  // Trigger sync in background
  syncPendingMutations().catch((err) =>
    console.error('Firestore deleteEntry sync failed:', err),
  );
};

export const clearAllEntries = async (): Promise<void> => {
  // Clear local cache, sync timestamp, and pending mutations immediately.
  await AsyncStorage.removeItem(CACHE_KEY);
  await AsyncStorage.removeItem(LAST_SYNC_KEY);
  await AsyncStorage.removeItem(PENDING_MUTATIONS_KEY);
  notifySubscribers([]);

  // Batch-delete from Firestore.
  const { getDocs: _getDocs } = await import('firebase/firestore');
  const snap = await _getDocs(studentsRef);
  const BATCH_SIZE = 450;
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
};

export const addEntry = async (
  entry: Omit<Entry, 'id' | 'createdAt'>,
): Promise<Entry> => {

  const id = Date.now().toString();
  const newEntry: Entry = {
    ...entry,
    id,
    subjects: entry.subjects || [],
    marks: entry.marks || {},
    fees: entry.fees || { first: 0, second: 0, third: 0, fourth: 0 },
    history: entry.history || [],
    profileImage: entry.profileImage || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), // for cloud
  };
  await updateCacheEntry(newEntry);
  const cached = await readCache();
  notifySubscribers(cached);

  // Add to pending mutations queue
  await addPendingMutation(id, 'UPSERT', newEntry);

  // Trigger sync in background
  syncPendingMutations().catch((err) =>
    console.error('Firestore addEntry sync failed:', err),
  );
  return newEntry;
};

export const updateEntry = async (updated: Entry): Promise<void> => {
  const finalEntry: Entry = {
    ...updated,
    updatedAt: new Date().toISOString(), // for cloud
  };

  // Update cache immediately.
  await updateCacheEntry(finalEntry);
  const cached = await readCache();
  notifySubscribers(cached);

  // Add to pending mutations queue
  await addPendingMutation(finalEntry.id, 'UPSERT', finalEntry);

  // Trigger sync in background
  syncPendingMutations().catch((err) =>
    console.error('Firestore updateEntry sync failed:', err),
  );
  
};