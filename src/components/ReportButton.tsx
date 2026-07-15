import { Ionicons } from '@expo/vector-icons';
import { Linking, TouchableOpacity } from 'react-native';
import { Entry } from '../storage/typeEntry';
import { colors } from '../styles/global';


export const handleReport = async ( entry: Entry ) => {
  const phone = String(entry.mobile).replace(/\D/g, '');
  
  // Build marks summary for each subject
  let marksSummary = '*Subject*                   *term-1*  *term-2*   *Total*\n\n';
  entry.subjects.forEach((subject) => {
    const subjectMarks = entry.marks[subject] || { quarter: null, halfYear: null, annual: null };

    const formatNumber = (num: number | null) => {
  if (num === null) return '-'.padStart(3);
  const numStr = String(num);
  // First pad the number, then add invisible characters
  const padded = numStr.padStart(3); // Pad to 3 characters first
  return padded.split('').join('\u200C'); // Then add zero-width joiners
};

    const quarter = formatNumber(subjectMarks.quarter)
    const halfYear = formatNumber(subjectMarks.halfYear)
    const annual = formatNumber(subjectMarks.annual)
    const paddedSubject = subject.padEnd(12, ' ');
    
    marksSummary += `\`${paddedSubject} ${quarter}   ${halfYear}   ${annual}\`\n`;
  });
  
  const message = `*Student Profile*
━━━━━━━━━━━━━━━━━━━━━━━━━
*Name:* ${entry.name}
*Reg No:* #${entry.regno}
*Class:* ${entry.standard}

*Marks Report*
━━━━━━━━━━━━━━━━━━━━━━━━━
${marksSummary}
`;
  
  const encodedMessage = encodeURIComponent(message);
  
  const ReportUrl = `https://wa.me/91${phone}?text=${encodedMessage}`;
    
  await Linking.openURL(ReportUrl);
    
};


type ReportButtonProps = {
  entry: Entry;  
};

export default function ReportButton({ entry }: ReportButtonProps) {
  return (
    <TouchableOpacity onPress={() => handleReport(entry)}>
      <Ionicons name='share-outline' size={28} color={colors.primary} />
    </TouchableOpacity>
  );
};

  