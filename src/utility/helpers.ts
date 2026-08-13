import { collection } from "firebase/firestore";
import * as XLSX from 'xlsx';
import { readCache } from "../storage/cacheService";
import { Entry, HistoricalRecord, SubjectMark } from '../storage/typeEntry';
import { db } from "./firebaseConfig";

export const studentsRef = collection(db, 'students');

export const getEntries = async (): Promise<Entry[]> => {
  const cached = await readCache();
  return cached;
};

// date handliing

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const monthMap: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

export const formatDateOutput = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

export const formatDate = (val?: string): string | undefined => {
    if (!val) return '';
    const parts = val.trim().split(/[\s-.]+/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const monthIndex = isNaN(Number(month))
        ? monthMap[month.toUpperCase()]
        : Number(month) - 1;
      if (monthIndex === undefined || isNaN(monthIndex)) return val;
      const yearNum = year.length === 2 ? 2000 + Number(year) : Number(year);
      const date = new Date(yearNum, monthIndex, Number(day));
      if (!isNaN(date.getTime())) {
        return formatDateOutput(date)
      }
    }
    return val;
};

export const parseAppDate = (dateStr?: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return undefined;
  const [day, month, year] = parts;
  const monthIndex = monthMap[month.toUpperCase()];
  if (monthIndex === undefined) return undefined;
  return new Date(2000 + Number(year), monthIndex, Number(day));
};

export const formatDateimport = (val?: any): string | undefined => {
  if (!val) return undefined;

  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      const d = new Date(date.y, date.m - 1, date.d);
      return formatDateOutput(d);
    }
  }


  
  const str = String(val).trim();

  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    const [a, b, c] = slashParts;
    const date = new Date(`${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return formatDateOutput(date);
    const date2 = new Date(`${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`);
    if (!isNaN(date2.getTime())) return formatDateOutput(date2);
  }

  const parts = str.split(/[\s-]+/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const monthIndex = isNaN(Number(month)) ? monthMap[month.toUpperCase()] : Number(month) - 1;
    if (monthIndex === undefined || isNaN(monthIndex)) return str;
    const date = new Date(2000 + Number(year), monthIndex, Number(day));
    if (!isNaN(date.getTime())) return formatDateOutput(date);
  }

  return str;
}


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
      flat[`${prefix}_${subject}_term_3`] = marks.annual;
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
        annual: row[`${prefix}_${subject}_term_3`] !== undefined ? Number(row[`${prefix}_${subject}_term_3`]) : null,
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
    flat[`${subject}_term_3`] = subjectMarks.annual;
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
      annual: row[`${subject}_term_3`] !== undefined ? Number(row[`${subject}_term_3`]) : null,
    };
  });
  return marks;
};
