import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { getEntries, saveEntries } from './coreCrud'; // Make sure saveEntries is exported from entries.ts
import { Entry, HistoricalRecord, SubjectMark, TermFees } from './typeEntry';

// Helper to flatten historical records for Excel export
const flattenHistory = (history: HistoricalRecord[]): { [key: string]: any } => {
  const flat: { [key: string]: any } = {};
  history.forEach((record, index) => {
    const prefix = `history_${index + 1}`;
    flat[`${prefix}_standard`] = record.standard;
    flat[`${prefix}_subjects`] = record.subjects.join(', ');
    flat[`${prefix}_movedAt`] = record.movedAt;
    
    // Flatten marks
    Object.entries(record.marks).forEach(([subject, marks]) => {
      flat[`${prefix}_${subject}_term_1`] = marks.quarter;
      flat[`${prefix}_${subject}_term_2`] = marks.halfYear;
      flat[`${prefix}_${subject}_total`] = marks.total;
    });
    
    // Flatten fees
    flat[`${prefix}_fees_first`] = record.fees.first;
    flat[`${prefix}_fees_second`] = record.fees.second;
    flat[`${prefix}_fees_third`] = record.fees.third;
    flat[`${prefix}_fees_fourth`] = record.fees.fourth;
  });
  return flat;
};

// Helper to parse flattened history from Excel import
const parseHistory = (row: any): HistoricalRecord[] => {
  const history: HistoricalRecord[] = [];
  let index = 1;
  
  while (row[`history_${index}_standard`] !== undefined) {
    const prefix = `history_${index}`;
    
    // Parse marks
    const marks: { [subjectName: string]: SubjectMark } = {};
    const subjects = row[`${prefix}_subjects`]?.split(',').map((s: string) => s.trim()) || [];
    
    subjects.forEach((subject: string) => {
      marks[subject] = {
        quarter: row[`${prefix}_${subject}_term_1`] !== undefined ? Number(row[`${prefix}_${subject}_term_1`]) : null,
        halfYear: row[`${prefix}_${subject}_term_2`] !== undefined ? Number(row[`${prefix}_${subject}_term_2`]) : null,
        total: row[`${prefix}_${subject}_total`] !== undefined ? Number(row[`${prefix}_${subject}_total`]) : null,
      };
    });
    
    history.push({
      standard: Number(row[`${prefix}_standard`]) || 0,
      subjects,
      marks,
      fees: {
        first: Number(row[`${prefix}_fees_first`]) || 0,
        second: Number(row[`${prefix}_fees_second`]) || 0,
        third: Number(row[`${prefix}_fees_third`]) || 0,
        fourth: Number(row[`${prefix}_fees_fourth`]) || 0,
      },
      movedAt: row[`${prefix}_movedAt`] || new Date().toISOString(),
    });
    
    index++;
  }
  
  return history;
};

// Helper to flatten marks for Excel
const flattenMarks = (marks: { [subjectName: string]: SubjectMark }): { [key: string]: any } => {
  const flat: { [key: string]: any } = {};
  Object.entries(marks).forEach(([subject, subjectMarks]) => {
    flat[`${subject}_term_1`] = subjectMarks.quarter;
    flat[`${subject}term_2`] = subjectMarks.halfYear;
    flat[`${subject}_total`] = subjectMarks.total;
  });
  return flat;
};

// Helper to parse marks from Excel import
const parseMarks = (row: any, subjects: string[]): { [subjectName: string]: SubjectMark } => {
  const marks: { [subjectName: string]: SubjectMark } = {};
  subjects.forEach((subject) => {
    marks[subject] = {
      quarter: row[`${subject}_term_1`] !== undefined ? Number(row[`${subject}_term_1`]) : null,
      halfYear: row[`${subject}_term_2`] !== undefined ? Number(row[`${subject}_term_2`]) : null,
      total: row[`${subject}_total`] !== undefined ? Number(row[`${subject}_total`]) : null,
    };
  });
  return marks;
};

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

    // Read existing entries from AsyncStorage
    const existingEntries = await getEntries();
    console.log('Existing entries before import:', existingEntries.length);
    
    // Merge: update existing entries or add new ones
    const mergedEntries = [...existingEntries];
    
    parsed.forEach((newEntry) => {
      const existingIndex = mergedEntries.findIndex((e) => e.id === newEntry.id);
      if (existingIndex >= 0) {
        // Update existing entry
        mergedEntries[existingIndex] = newEntry;
        console.log(`Updated entry: ${newEntry.id}`);
      } else {
        // Add new entry
        mergedEntries.push(newEntry);
        console.log(`Added new entry: ${newEntry.id}`);
      }
    });

    // ******* CRITICAL FIX: Save the merged data back to AsyncStorage *******
    await saveEntries(mergedEntries);
    console.log(`Saved ${mergedEntries.length} entries to AsyncStorage`);
    
    // Verify data was saved
    const verifyEntries = await getEntries();
    console.log('Verification - Total entries after save:', verifyEntries.length);

  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};