export type SubjectMark = {
  quarter: number | null;
  halfYear: number | null;
  annual: number | null;
};

export type TermFees = {
  first: number;
  second: number;
  third: number;
  fourth: number;
};

export type HistoricalRecord = {
  standard: number;
  subjects: string[];
  marks: {
    [subjectName: string]: SubjectMark;
  };
  fees: TermFees;
  movedAt: string;
};

export type Entry = {
  id: string;
  name: string;
  regno: number;
  mobile: number;
  standard: number; // represents current class
  active: 'ACTIVE' | 'REMOVED';
  profileImage: string | null; // base64 image data or URI
  subjects: string[]; // up to 8 subjects
  marks: {
    [subjectName: string]: SubjectMark;
  };
  fees: TermFees;
  history: HistoricalRecord[];
  createdAt: string;
  updatedAt?: string; // for cloud
};