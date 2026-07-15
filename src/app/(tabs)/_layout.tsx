import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppMode } from '../../storage/appModeContext';
import { getEntries } from '../../storage/helpers';
import { subscribeToEntries } from '../../storage/subscription';
import { Entry } from '../../storage/typeEntry';
import { colors } from '../../styles/global';


import NetworkToast from '../../components/NetworkToast';
import AddEntryScreen from './add-entry';
import AllEntriesScreen from './entries';
import HomeScreen from './index';

const TABS = [
  { id: 0, name: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { id: 1, name: 'Add Entry', icon: 'add', iconOutline: 'add-outline' },
  { id: 2, name: 'All Entries', icon: 'list', iconOutline: 'list-outline' },
];

export default function TabLayout() {
  
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const [entries, setEntries] = useState<Entry[]>([]);
  const { mode } = useAppMode();
  const isViewMode = mode === 'view';

  // Dynamic visible tabs list
  const visibleTabs = isViewMode
  ? [
      { ...TABS[0], pagerIndex: 0 }, // Home
      { ...TABS[2], pagerIndex: 1 }, // All Entries (real index 1 now)
    ]
  : [
      { ...TABS[0], pagerIndex: 0 },
      { ...TABS[1], pagerIndex: 1 },
      { ...TABS[2], pagerIndex: 2 },
    ];

    
  const loadEntries = async () => {
    const data = await getEntries();
    console.log('LOAD ENTRIES', data.length);
    setEntries(data);
  };

  const goToTab = (pagerIndex: number) => {
    setActiveTab(pagerIndex);
    pagerRef.current?.setPage(pagerIndex);
  };

  const [searchVisible, setSearchVisible] = useState(false);
 
  const openAllEntriesWithSearch = () => {
  setSearchVisible(true);
  goToTab(isViewMode ? 1 : 2);
};

  const [pages, setPages] = useState([
  { key: 'home', component: HomeScreen },
  { key: 'add', component: AddEntryScreen },
  { key: 'entries', component: AllEntriesScreen },
]);

// Update pages when mode changes
useEffect(() => {
  if (isViewMode) {
    setPages([
      { key: 'home', component: HomeScreen },
      { key: 'entries', component: AllEntriesScreen },
    ]);
  } else {
    setPages([
      { key: 'home', component: HomeScreen },
      { key: 'add', component: AddEntryScreen },
      { key: 'entries', component: AllEntriesScreen },
    ]);
  }
}, [isViewMode]);

  useEffect(() => {
    const unsubscribe = subscribeToEntries(setEntries);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
  if (isViewMode) {
    setPages([
      { key: 'home', component: HomeScreen },
      { key: 'entries', component: AllEntriesScreen },
    ]);
  } else {
    setPages([
      { key: 'home', component: HomeScreen },
      { key: 'add', component: AddEntryScreen },
      { key: 'entries', component: AllEntriesScreen },
    ]);
  }
  setActiveTab(0); // reset to home whenever mode toggles
}, [isViewMode]);


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* VIEW MODE FIX */}
      <PagerView
       key={isViewMode ? 'view-mode' : 'edit-mode'}  // forces remount on mode change
       ref={pagerRef}
       style={{ flex: 1 }}
       initialPage={0}
       onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
       >
       {pages.map((page) => {
         if (page.key === 'home') {
           return (
             <View key="home-slide" style={{ flex: 1 }}>
               <HomeScreen
                 reload={loadEntries}
                 openAllEntriesWithSearch={openAllEntriesWithSearch}
                 entries={entries}
               />
             </View>
           );
         }
         if (page.key === 'add') {
           return (
             <View key="add-slide" style={{ flex: 1 }}>
               <AddEntryScreen />
             </View>
           );
         }
         return (
           <View key="entries-slide" style={{ flex: 1 }}>
             <AllEntriesScreen
               reload={loadEntries}
               searchVisible={searchVisible}
               setSearchVisible={setSearchVisible}
               entries={entries}
             />
           </View>
         );
       })}
     </PagerView>

       <NetworkToast/>
       
      {/* Custom Tab Bar */}
      <View style={[styles.tabBar, { bottom: insets.bottom + 16 }]}>
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {visibleTabs.map((tab) => {
          const focused = activeTab === tab.pagerIndex;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => goToTab(tab.pagerIndex)}
            >
              <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
                <Ionicons
                  name={(focused ? tab.icon : tab.iconOutline) as any}
                  size={tab.id === 0 ? 22 : tab.id === 1 ? 26 : 24}
                  color={focused ? colors.primary : 'rgba(255,255,255,0.45)'}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.surface,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    backgroundColor: `${colors.primary}22`,
    borderRadius:13,
  },
});