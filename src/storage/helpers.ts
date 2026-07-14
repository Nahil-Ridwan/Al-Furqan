import { collection } from "firebase/firestore";
import { readCache } from "./cacheService";
import { db } from "./firebaseConfig";
import { Entry, HistoricalRecord, SubjectMark } from './typeEntry';

export const studentsRef = collection(db, 'students');

export const getEntries = async (): Promise<Entry[]> => {
  const cached = await readCache();
  return cached;
};

// Helper to flatten historical records for Excel export
export const flattenHistory = (history: HistoricalRecord[]): { [key: string]: any } => {
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
export const parseHistory = (row: any): HistoricalRecord[] => {
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
export const flattenMarks = (marks: { [subjectName: string]: SubjectMark }): { [key: string]: any } => {
  const flat: { [key: string]: any } = {};
  Object.entries(marks).forEach(([subject, subjectMarks]) => {
    flat[`${subject}_term_1`] = subjectMarks.quarter;
    flat[`${subject}term_2`] = subjectMarks.halfYear;
    flat[`${subject}_total`] = subjectMarks.total;
  });
  return flat;
};

// Helper to parse marks from Excel import
export const parseMarks = (row: any, subjects: string[]): { [subjectName: string]: SubjectMark } => {
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
