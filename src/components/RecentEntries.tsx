import { StyleSheet, Text, View } from 'react-native';
import { Entry } from '../storage/typeEntry';
import { colors } from '../styles/global';
import EntryItem from './EntryItem';

type RecentEntriesProps = {
  entries: Entry[];
  onDelete: () => void;
};

export default function RecentEntries({ entries = [], onDelete }: RecentEntriesProps) {
  return (
    <View style={{ marginTop: 10, paddingBottom: 100 }}>
      <Text style={styles.sectionTitle}>Recently Added Students</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>No students registered yet.</Text>
      ) : (
        entries
          .slice(0, 4)
          .map((entry) => (
            <EntryItem
              key={entry.id}
              student={entry}
              onDelete={onDelete}
            />
          ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});