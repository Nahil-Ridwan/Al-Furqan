import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HomeHeader from '../../components/HomeHeader';
import MacroGrid from '../../components/MacroGrid';
import RecentEntries from '../../components/RecentEntries';
import { exportEntries, pickAndImportEntries } from '../../storage/importExport';
import { Entry } from '../../storage/typeEntry';
import { colors, globalStyles } from '../../styles/global';

type Props = {
  entries: Entry[];
  openAllEntriesWithSearch: () => void;
  reload: () => Promise<void>;
};

export default function HomeScreen({ entries = [], openAllEntriesWithSearch, reload = async () => {} } : Props) {

  const handleImport = async () => {
  try {
    await pickAndImportEntries();

    await reload();

    Alert.alert(
      'Import complete',
      'All entries imported successfully.'
    );
  } catch (err: any) {
    Alert.alert(
      'Import issue',
      err?.message ?? 'Something went wrong during import.'
    );
  }
};

  useFocusEffect(
    useCallback(() => {
      reload();
    }, []),
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={globalStyles.container}>
        <View style={globalStyles.header}>
          <Text style={globalStyles.title}>Al-Furqan</Text>

          <TouchableOpacity style={{ marginTop: 8, marginLeft: 55 }}>
            <Ionicons name='cloud-download-outline' size={26} color={colors.primary} onPress={handleImport}/>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 8, marginRight: 17 }}>
            <Ionicons name='cloud-upload-outline' size={26} color={colors.primary} onPress={exportEntries}/>
          </TouchableOpacity>

        </View>
        <HomeHeader />
        <MacroGrid entries={entries} openAllEntriesWithSearch={openAllEntriesWithSearch}/>
        <RecentEntries entries={entries} onDelete={reload}/>
      </ScrollView>
    </View>
    );
}