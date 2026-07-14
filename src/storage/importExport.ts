import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { doc, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { readCache, writeCache } from './cacheService';
import { db } from './firebaseConfig';
import { flattenHistory, flattenMarks, getEntries, parseHistory, parseMarks, studentsRef } from './helpers';
import { addPendingMutations, removePendingMutations, syncPendingMutations, } from './offlineMutation';
import { notifySubscribers } from './subscription';
import { Entry, TermFees } from './typeEntry';


// ---- Export to Excel ----
export const exportEntries = async (): Promise<void> => {
  const entries = await getEntries();

  if (entries.length === 0) {
    throw new Error('No entries to export');
  }

  const safeEntries = entries.map((e) => {
    const row: any = {
      id: e.id,
      name: e.name,
      regno: e.regno,
      mobile: e.mobile,
      standard: e.standard,
      active: e.active,
      profileImage: e.profileImage || '',
      subjects: e.subjects.join(', '),
      createdAt: e.createdAt,
    };

    // Flatten marks
    const marksFlat = flattenMarks(e.marks);
    Object.assign(row, marksFlat);

    // Flatten fees
    row.fees_first = e.fees.first;
    row.fees_second = e.fees.second;
    row.fees_third = e.fees.third;
    row.fees_fourth = e.fees.fourth;

    // Flatten history
    const historyFlat = flattenHistory(e.history);
    Object.assign(row, historyFlat);

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(safeEntries);

  // Set column widths for better readability
  const colWidths = Object.keys(safeEntries[0] || {}).map(() => ({ wch: 15 }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries');
  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

  const fileUri = FileSystem.documentDirectory + 'student_records_backup.xlsx';
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(fileUri);
};

// ---- Import from Excel ----
export const pickAndImportEntries = async (): Promise<void> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    if (result.canceled) return;

    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const workbook = XLSX.read(base64, { type: 'base64', cellText: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<any>(sheet, { raw: true });

    if (data.length === 0) {
      throw new Error('The Excel file appears to be empty');
    }

    const parsed: Entry[] = data.map((row) => {
      // Parse subjects from comma-separated string
      const subjects = row.subjects?.split(',').map((s: string) => s.trim()) || [];

      // Parse marks
      const marks = parseMarks(row, subjects);

      // Parse fees
      const fees: TermFees = {
        first: Number(row.fees_first) || 0,
        second: Number(row.fees_second) || 0,
        third: Number(row.fees_third) || 0,
        fourth: Number(row.fees_fourth) || 0,
      };

      // Parse history
      const history = parseHistory(row);

      return {
        id: row.id || Date.now().toString() + Math.random().toString(36).slice(2),
        name: row.name || '',
        regno: Number(row.regno) || 0,
        mobile: Number(row.mobile) || 0,
        standard: Number(row.standard) || 0,
        profileImage: row.profileImage || null,
        active: row.active === 'REMOVED' ? 'REMOVED' : 'ACTIVE', // Parse string
        subjects,
        marks,
        fees,
        history,
        createdAt: row.createdAt || new Date().toISOString(),
      };
    });

    // Write to AsyncStorage cache immediately so the UI reflects the import
  // right away without waiting for Firestore.
  const existingCache = await readCache();
  const merged = [
    ...existingCache.filter((e) => !parsed.some((p) => p.id === e.id)),
    ...parsed,
  ];
  await writeCache(merged);
  notifySubscribers(merged);

  // Add all imported entries to the pending mutations queue
  const mutationsToQueue = parsed.map((entry) => ({
    id: entry.id,
    type: 'UPSERT' as const,
    entry,
  }));
  await addPendingMutations(mutationsToQueue);

  // Batch-write to Firestore in the background.
  const BATCH_SIZE = 450;
  let written = 0;
  const failedBatches: number[] = [];

  for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
    const chunk = parsed.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((entry) => {
      batch.set(doc(studentsRef, entry.id), entry);
    });

    try {
      await batch.commit();
      written += chunk.length;
      // Successfully committed this batch, remove these from the pending mutations queue
      const idsToRemove = chunk.map((e) => e.id);
      await removePendingMutations(idsToRemove);
    } catch (err) {
      console.error(`Failed to import batch starting at row ${i}:`, err);
      failedBatches.push(i);
    }
  }

  // Trigger background sync to attempt uploading any failed batches
  syncPendingMutations().catch((err) =>
    console.error('Firestore import background sync failed:', err),
  );

  if (failedBatches.length > 0) {
    throw new Error(
      `Imported ${written}/${parsed.length} entries. ${failedBatches.length} batch(es) failed — check your connection and try importing again.`,
    );
  }
} catch (err) {
  console.log(err,'error');
  
}
};