import { StyleSheet, View } from 'react-native';
import { Entry } from '../storage/typeEntry';
import { colors } from '../styles/global';
import StatsCard from './MacroCard';

type StatsGridProps = {
  entries: Entry[];
  openAllEntriesWithSearch: () => void;
};

export default function StatsGrid({ entries = [], openAllEntriesWithSearch }: StatsGridProps) {
  const totalStudents = entries.length;
  const uniqueGrades = new Set(entries.map((e) => e.standard)).size;
  
  return (
    <View style={styles.grid}>
      <StatsCard
        label="Students"
        value={`${totalStudents}`}
        subtext="Total enrolled"
        color= {colors.primary}
        onPress={openAllEntriesWithSearch}
      />
      <StatsCard
        label="Classes"
        value={`${uniqueGrades}`}
        subtext="Active classes"
        color= {colors.primary}
        onPress={openAllEntriesWithSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 5,
    marginTop: 10,
  },
});