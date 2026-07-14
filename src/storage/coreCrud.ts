import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entry } from './typeEntry';

const ENTRIES_KEY = 'entries';

export async function getEntryById(id: string): Promise<Entry | null> {
  const json = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!json) return null;

  const entries: Entry[] = JSON.parse(json);
  return entries.find(entry => entry.id === id) ?? null;
}

export const getEntries = async (): Promise<Entry[]> => {
  const data = await AsyncStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEntries = async (entries: Entry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    console.log(`Saved ${entries.length} entries`);
  } catch (error) {
    console.error('Error saving entries:', error);
    throw error;
  }
};


export const deleteEntry = async (id: string): Promise<void> => {
  const entries = await getEntries();
  const filtered = entries.filter((entry) => entry.id !== id);
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
};

export const clearAllEntries = async (): Promise<void> => {
  await AsyncStorage.removeItem(ENTRIES_KEY);
};

export const addEntry = async (
  entry: Omit<Entry, 'id' | 'createdAt'>,
): Promise<Entry> => {
  const entries = await getEntries();
  const newEntry: Entry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    subjects: entry.subjects || [],
    marks: entry.marks || {},
    fees: entry.fees || { quarter: 0, halfYear: 0, total: 0 },
    history: entry.history || [],
    profileImage: entry.profileImage || null,
  };
  console.log('new entry : ',newEntry.name, newEntry.active)
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify([newEntry, ...entries]));
  return newEntry;
};

export const updateEntry = async (updated: Entry): Promise<void> => {
  const entries = await getEntries();
  const index = entries.findIndex((entry) => entry.id === updated.id);
  if (index !== -1) {
    entries[index] = updated;
    console.log('updated : ',updated.name, updated.active);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }
};