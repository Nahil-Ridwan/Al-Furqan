import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EntryItem from '../../components/EntryItem';
import { clearAllEntries } from '../../storage/coreCrud';
import { Entry } from '../../storage/typeEntry';
import { colors, globalStyles } from '../../styles/global';

type Props = {
  entries: Entry[];
  searchVisible: boolean;
  setSearchVisible: (value: boolean) => void;
  reload: () => Promise<void>;
};

export default function AllEntriesScreen({ entries = [], searchVisible, setSearchVisible, reload = async () => {} }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterStandard, setFilterStandard] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger reload on focus to make sure newly added students appear
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 300);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All Records!', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAllEntries();
            reload();
          } catch (err) {
            console.error('Failed to clear entries:', err);
            Alert.alert('Error', 'Failed to delete some records. Try again.');
          }
        },
      },
    ]);
  };

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    return entries.filter((entry) => {
      const matchesQuery =
        !q ||
        (String(entry.name ?? '').toLowerCase().includes(q) ||
          String(entry.mobile ?? '').toLowerCase().includes(q) ||
          String(entry.regno ?? '').toLowerCase().includes(q) ||
          String(entry.active ?? '').toLowerCase().includes(q) ||
          String(entry.standard ?? '').toLowerCase().includes(q));
          
      
      const matchesStandard =
        !filterStandard ||
        String(entry.standard ?? '')
          .toLowerCase()
          .includes(filterStandard.trim().toLowerCase());

      return matchesQuery && matchesStandard;
    });
  }, [debouncedQuery, entries, filterStandard]);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    setQuery('');
    setDebouncedQuery('');
    setFilterStandard('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Scrollable list */}
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlashList
        key={searchVisible ? 'search-open' : 'search-closed'}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 140,
          paddingTop: headerHeight + 10,
        }}
        data={filtered}
        keyExtractor={(entry) => String(entry.id)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={globalStyles.empty}>No student records found.</Text>
          </View>
        }
        renderItem={({ item: entry }) => (
          <EntryItem
            key={entry.id}
            student={entry}
            onDelete={reload}
          />
        )}
      />
      </KeyboardAvoidingView>

      {/* Header — absolutely positioned so list scrolls behind it */}
      <View
        style={styles.header}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={globalStyles.header}>
          <Text
            onLongPress={handleClearAll}
            style={[globalStyles.title, { marginBottom: 15, marginLeft: 6 }]}
          >
            All Students
          </Text>
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons
              style={{ marginBottom: 10, marginRight: 13 }}
              name={searchVisible ? 'close-outline' : 'search-outline'}
              size={26}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { flex: 2 }]}
              placeholder="Search Students"
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            <TextInput
              style={[styles.searchInput, { flex: 1 }]}
              placeholder="Class"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={filterStandard}
              onChangeText={setFilterStandard}
            />
          </View>
        )}

        {searchVisible && (
          <Text style={styles.resultsCount}>
            Showing {filtered.length} student{filtered.length !== 1 ? 's...' : '...'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
    elevation: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultsCount: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
});
