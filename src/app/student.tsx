import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { getEntryById, updateEntry } from '../storage/coreCrud';
import { Entry, SubjectMark, TermFees } from '../storage/typeEntry';
import { colors, globalStyles } from '../styles/global';
import { styles } from '../styles/student';
import { useAppMode } from '../utility/appModeContext';
import { formatDate } from '../utility/helpers';
import { GRADE_SUBJECTS } from '../utility/subjectList';



type TabType = 'marks' | 'fees' | 'promote' | 'history';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [student, setStudent] = useState<Entry | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('marks');
  const [loading, setLoading] = useState(true);
  const { mode } = useAppMode();
  const isViewMode = mode === 'view';

  // Promotion Local State
  const [promoStandard, setPromoStandard] = useState('');

  // Autosave
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  

  // Add these lines right after your existing state declarations
  const pagerRef = useRef<PagerView>(null);
  const tabTypes: TabType[] = isViewMode
    ? ['marks', 'fees', 'history']
    : ['marks', 'fees', 'promote', 'history'];

  // Scroll animation setup for Profile Card collapse & fade out
  const scrollY = useRef(new Animated.Value(0)).current;
  const [profileHeight, setProfileHeight] = useState(260);
  const profileHeightMeasured = useRef(false);

  useEffect(() => {
    profileHeightMeasured.current = false;
  }, [id]);

  const scrollPositions = useRef<Record<TabType, number>>({
    marks: 0,
    fees: 0,
    promote: 0,
    history: 0,
  });

  const onProfileLayout = (e: LayoutChangeEvent) => {
    if (profileHeightMeasured.current) return;
    const { height } = e.nativeEvent.layout;
    if (height > 50) {
      profileHeightMeasured.current = true;
      setProfileHeight(height);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const y = event?.nativeEvent?.contentOffset?.y || 0;
        scrollPositions.current[activeTab] = y;
      },
    }
  );

  const collapseDistance = Math.max(1, profileHeight);

  const profileOpacity = scrollY.interpolate({
    inputRange: [0, collapseDistance * 0.6, collapseDistance],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });

  const profileHeightAnim = scrollY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [profileHeight, 0],
    extrapolate: 'clamp',
  });

  const handleTabPress = (tab: TabType) => {
    const index = tabTypes.indexOf(tab);
    pagerRef.current?.setPage(index);
  };

  

  useEffect(() => {
    async function loadStudent() {
      if (!id) return;
      try {
        const data = await getEntryById(id);
        if (data) {
          setStudent(data);
          // Initialize promotion fields
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load student details.');
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  // Autosave

  useEffect(() => {
  // Skip autosave on initial load / when student hasn't been fetched yet
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  if (!student || isViewMode) return;

  if (saveTimer.current) clearTimeout(saveTimer.current);
  

  saveTimer.current = setTimeout(async () => {
    try {
      await updateEntry(student);
  
  
    } catch (err) {
      console.error(err);
  
      Alert.alert('Error', 'Failed to save changes.');
    }
  }, 600); // 600ms after the last keystroke

  return () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  };
  }, [student?.marks,
      student?.fees,
      student?.name,
      student?.regno,
      student?.dob,
      student?.standard,
      student?.guardian,
      student?.mobile,
    ]);

  // Sync PagerView when activeTab changes programmatically



  if (loading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading student profile...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <Text style={styles.errorText}>Student record not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { name, regno, dob, mobile, standard, guardian, profileImage, subjects = [], marks = {}, fees, history = [] } = student;

  const handleProfileImageChange = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access gallery is required to change profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Str = result.assets[0].base64;
        const newImage = base64Str ? `data:image/jpeg;base64,${base64Str}` : result.assets[0].uri;
        const updated = { ...student, profileImage: newImage };
        setStudent(updated);
        await updateEntry(updated);
        Alert.alert('Success', 'Profile image updated successfully!');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile image.');
    }
  };


  const handleMarkChange = (subject: string, term: keyof SubjectMark, val: string) => {
  // Don't allow editing of total field
  
  const trimmedVal = val.trim();
  
  // Allow clearing the field
  if (trimmedVal === '') {
    const currentSubjectMarks = marks[subject] || { quarter: null, halfYear: null, annual: null };
    const updatedTermMarks = {
      ...currentSubjectMarks,
      [term]: null,
    };
    
    
    const updatedMarks = {
      ...marks,
      [subject]: updatedTermMarks,
    };

    setStudent({
      ...student,
      marks: updatedMarks,
    });
    return;
  }
  
  const parsed = Number(trimmedVal);
  
  // Validate the input
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    return; // prevent invalid inputs
  }

  const currentSubjectMarks = marks[subject] || { quarter: null, halfYear: null, annual: null };
  
  // Create updated marks with the new value
  const updatedTermMarks = {
    ...currentSubjectMarks,
    [term]: parsed,
  };
  
  // Auto-calculate total

  const updatedMarks = {
    ...marks,
    [subject]: updatedTermMarks,
  };

  setStudent({
    ...student,
    marks: updatedMarks,
  });
};

  const handleFeeChange = (term: keyof TermFees, val: string) => {
    const trimmedVal = val.trim();
    const parsed = trimmedVal === '' ? 0 : Number(trimmedVal);

    if (isNaN(parsed) || parsed < 0) {
      return; // prevent negative or invalid values
    }

    const updatedFees = {
      ...fees,
      [term]: parsed,
    };

    setStudent({
      ...student,
      fees: updatedFees,
    });

  };

  const sumSubjectMarks = (term: keyof SubjectMark): number | null => {
  let hasAny = false;
  const sum = subjects.reduce((acc, subj) => {
    const val = marks[subj]?.[term];
    if (val !== null && val !== undefined) {
      hasAny = true;
      return acc + val;
    }
    return acc;
  }, 0);
  return hasAny ? sum : null;
};

  const totalQuarter = sumSubjectMarks('quarter');
  const totalHalfYear = sumSubjectMarks('halfYear');
  const totalAnnual = sumSubjectMarks('annual');

  const handlePromoteStudent = () => {
    if (!promoStandard.trim() || isNaN(Number(promoStandard))) {
      Alert.alert('Validation Error', 'Please enter a valid  class.');
      return;
    }

    const newGrade = Number(promoStandard);
    if (newGrade <= standard) {
      Alert.alert('Invalid Class', 'New class must be higher than current class.');
      return;
    }

    if (!GRADE_SUBJECTS[newGrade]) {
      Alert.alert('Invalid Class', 'Please enter a class between 1 and 7.');
      return;
    }

    const newSubjects = GRADE_SUBJECTS[newGrade];

    Alert.alert(
      'Confirm Promotion',
      `Move ${name} to Class ${newGrade}? Current marks and fees will be archived.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          style: 'default',
          onPress: async () => {
            try {
              // Create history entry
              const historyEntry = {
                standard: student.standard,
                subjects: student.subjects || [],
                marks: student.marks || {},
                fees: student.fees || { first: 0, second: 0, third: 0, fourth: 0 },
                movedAt: new Date().toISOString(),
              };

              // Initialize marks for new subjects
              const newMarks = newSubjects.reduce((acc, sub) => {
              acc[sub] = { quarter: null, halfYear: null, annual: null };
              return acc;
              }, {} as Record<string, SubjectMark>);

              // Update student object
              const promotedStudent: Entry = {
                ...student,
                standard: newGrade,
                subjects: newSubjects,
                marks: newMarks,
                fees: { first: 0, second: 0, third: 0, fourth: 0 },
                history: [historyEntry, ...(history || [])],
              };

              setStudent(promotedStudent);
              await updateEntry(promotedStudent);
          
              const marksIndex = tabTypes.indexOf('marks');
    
              // Update both activeTab and PagerView
              setActiveTab('marks');
              
              // Small delay to ensure state is updated before changing page
              setTimeout(() => {
                pagerRef.current?.setPage(marksIndex);
              }, 100);
              setPromoStandard('');
              Alert.alert('Success', `Student promoted to Class ${newGrade}!`);
              
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to process promotion.');
            }
          },
        },
      ]
    );
  };

  
  return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: colors.background }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    enabled={Platform.OS === 'ios'}
  >
    <View style={{ flex: 1 }}>
      {/* Header Section - Fixed */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Animated Profile Card (Upper Part) */}
      <Animated.View
        style={{
          height: profileHeightAnim,
          opacity: profileOpacity,
          overflow: 'hidden',
        }}
      >
        <View
          onLayout={onProfileLayout}
          style={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 16,
          }}
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, { margin: 0 }]}>
            {/* Top - Avatar centered with ring */}
            <TouchableOpacity 
              onPress={handleProfileImageChange} 
              disabled={isViewMode}
              style={styles.avatarRingContainer}
            >
              <View style={styles.avatarRing}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                    <Text style={styles.avatarText}>
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
              </View>
              {!isViewMode && (
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color={colors.background} />
                </View>
              )}
            </TouchableOpacity>
          
            {/* Name */}
              <TextInput
                style={styles.studentNameCentered}
                value={name}
                onChangeText={(text) => setStudent({ ...student, name: text })}
                placeholder='Full Name'
                placeholderTextColor={colors.textSecondary}
                textAlign="center"
                editable={!isViewMode}
              />
          
            {/* Subtitle - class */}
              <View style={styles.tagRow}>
              <TextInput
                style={styles.subtitleCentered}
                value={String('Class '+standard)}
                keyboardType='numeric'
                onChangeText={(text) => setStudent({ ...student, standard: Number(text) })}
                placeholder='Class'
                placeholderTextColor={colors.textSecondary}
                textAlign="center"
                editable={!isViewMode}
              />
          
            {/* Tag-style pills row */}
          
          
              <View style={styles.tagPill}>
                <Text style={{ color: colors.text}}>#</Text>
                  <TextInput
                    style={styles.tagText}
                    value={String(regno)}
                    keyboardType='numeric'
                    onChangeText={(text) => setStudent({ ...student, regno: Number(text) })}
                    placeholder='reg no'
                    placeholderTextColor={colors.textSecondary}
                    editable={!isViewMode}
                  />
              </View>
          
            </View>
          
            {/* Stats row - DOB & Mobile shown like Rating/Earned/Rate */}
            <View style={styles.statsRow}>
          
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.text} />
                  <TextInput
                    style={styles.statValue}
                    value={dob}
                    onChangeText={(text) => {
                      const date = formatDate(text);
                      setStudent({ ...student, dob: String(date) });
                    }}
                    placeholder='Date of birth'
                    placeholderTextColor={colors.textSecondary}
                    textAlign="center"
                    editable={!isViewMode}
                  />
              </View>
          
              <View style={styles.statDivider} />
          
              <View style={styles.statItem}>
                <Ionicons name="person-outline" size={16} color={colors.text} />
                  <TextInput
                    style={styles.statValue}
                    value={guardian}
                    onChangeText={(text) => setStudent({ ...student, guardian: text })}
                    placeholder='Guardian'
                    placeholderTextColor={colors.textSecondary}
                    textAlign="center"
                    editable={!isViewMode}
                  />
              </View>
          
              <View style={styles.statDivider} />
          
              <View style={styles.statItem}>
                <Ionicons name="call-outline" size={16} color={colors.text} />
                  <TextInput
                    style={styles.statValue}
                    value={String(mobile)}
                    keyboardType='numeric'
                    onChangeText={(text) => setStudent({ ...student, mobile: Number(text) })}
                    placeholder='Mobile'
                    placeholderTextColor={colors.textSecondary}
                    textAlign="center"
                    editable={!isViewMode}
                  />
              </View>
            </View>
          
          </View>
        </View>
      </Animated.View>

      {/* Custom Tab Segment */}
      <View style={styles.tabContainer}>
       {tabTypes.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'marks' && 'Marks'}
              {tab === 'fees' && 'Fees'}
              {tab === 'promote' && 'Promote'}
              {tab === 'history' && 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content area with PagerView - Takes remaining space */}
      <View style={styles.tabContent}>
        <PagerView
          key={isViewMode ? 'view-mode' : 'edit-mode'}
          ref={pagerRef}
          style={styles.pagerView}
          pageMargin={13}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            const newTab = tabTypes[index];
            setActiveTab(newTab);
            const targetY = scrollPositions.current[newTab] || 0;
            Animated.timing(scrollY, {
              toValue: targetY,
              duration: 250,
              useNativeDriver: false,
            }).start();
          }}        
>
          {tabTypes.map((tab) => {
            if (tab === 'marks') {
              return (
                <View key="marks" style={styles.page}>
                  <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    <View style={styles.innerSection}>
                      <Text style={styles.sectionTitle}>Exam Marks</Text>
                      {subjects.length === 0 ? (
                        <Text style={styles.emptyText}>No subjects currently assigned.</Text>
                      ) : (
                      <>
                        { subjects.map((subject) => {
                          const sMarks = marks[subject] || { quarter: null, halfYear: null, annual: null };
                          return (
                            <View key={subject} style={styles.subjectMarkRow}>
                              <Text style={styles.subjectName}>{subject}</Text>
                              <View style={styles.inputsRow}>
                                <View style={styles.inputCol}>
                                  <Text style={styles.inputLabel}>Term-1</Text>
                                  <TextInput
                                    style={styles.scoreInput}
                                    placeholder="-"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={sMarks.quarter !== null ? String(sMarks.quarter) : ''}
                                    onChangeText={(val) => handleMarkChange(subject, 'quarter', val)}
                                    editable={!isViewMode}
                                  />
                                </View>
                                <View style={styles.inputCol}>
                                  <Text style={styles.inputLabel}>Term-2</Text>
                                  <TextInput
                                    style={styles.scoreInput}
                                    placeholder="-"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={sMarks.halfYear !== null ? String(sMarks.halfYear) : ''}
                                    onChangeText={(val) => handleMarkChange(subject, 'halfYear', val)}
                                    editable={!isViewMode}
                                  />
                                </View>
                                <View style={styles.inputCol}>
                                  <Text style={styles.inputLabel}>Term-3</Text>
                                  <TextInput
                                    style={styles.scoreInput}
                                    placeholder="-"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={sMarks.annual !== null ? String(sMarks.annual) : ''}
                                    onChangeText={(val) => handleMarkChange(subject, 'annual', val)}
                                    editable={!isViewMode}
                                  />
                                </View>
                              </View>
                            </View>
                          );
                        })}

                        {/* TOTAL ROW — computed, read-only */}
                        <View style={[styles.subjectMarkRow, { paddingTop: 8 }]}>
                          <Text style={[styles.subjectName, { fontWeight: '700' }]}>Total</Text>
                          <View style={styles.inputsRow}>
                            <View style={styles.inputCol}>
                              <Text style={styles.inputLabel}>Term-1</Text>
                              <View style={styles.totalscoreInput}>
                                <Text style={styles.totalText}>
                                  {totalQuarter !== null ? totalQuarter : '-'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.inputCol}>
                              <Text style={styles.inputLabel}>Term-2</Text>
                              <View style={styles.totalscoreInput}>
                                <Text style={styles.totalText}>
                                  {totalHalfYear !== null ? totalHalfYear : '-'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.inputCol}>
                              <Text style={styles.inputLabel}>Term-3</Text>
                              <View style={styles.totalscoreInput}>
                                <Text style={styles.totalText}>
                                  {totalAnnual !== null ? totalAnnual : '-'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </>
                      )}
                    </View>
                  </Animated.ScrollView>
                </View>
              );
                    }

            if (tab === 'fees') {
              return (
                <View key="fees" style={styles.page}>
                  <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    <View style={styles.innerSection}>
                      <Text style={[styles.sectionTitle, { marginLeft: 3 }]}>Fees Payment</Text>
                      <View style={styles.feeForm}>
                        <View style={styles.feeInputRow}>
                          <Text style={styles.feeLabel}>1st Installment</Text>
                          <TextInput
                            style={styles.feeInput}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={fees?.first ? String(fees.first) : ''}
                            onChangeText={(val) => handleFeeChange('first', val)}
                            editable={!isViewMode}
                          />
                        </View>
                        <View style={styles.feeInputRow}>
                          <Text style={styles.feeLabel}>2nd Installment</Text>
                          <TextInput
                            style={styles.feeInput}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={fees?.second ? String(fees.second) : ''}
                            onChangeText={(val) => handleFeeChange('second', val)}
                            editable={!isViewMode}
                          />
                        </View>
                        <View style={styles.feeInputRow}>
                          <Text style={styles.feeLabel}>3rd Installment</Text>
                          <TextInput
                            style={styles.feeInput}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={fees?.third ? String(fees.third) : ''}
                            onChangeText={(val) => handleFeeChange('third', val)}
                            editable={!isViewMode}
                          />
                        </View>
                        <View style={styles.feeInputRow}>
                          <Text style={styles.feeLabel}>4th Installment</Text>
                          <TextInput
                            style={styles.feeInput}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={fees?.fourth ? String(fees.fourth) : ''}
                            onChangeText={(val) => handleFeeChange('fourth', val)}
                            editable={!isViewMode}
                          />
                        </View>
                        <Text style={styles.feeTotalVal}>
                          Total : {((fees?.first || 0) + (fees?.second || 0) + (fees?.third || 0) + (fees?.fourth || 0)).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </Animated.ScrollView>
                </View>
              );
            }

            if (tab === 'promote') {
              return (
                <View key="promote" style={styles.page}>
                  <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    <View style={styles.innerSection}>
                      <Text style={styles.sectionTitle}>Move Class</Text>
                      <Text style={[styles.sectionSubtitle, { marginTop: -12 }]}>
                        Promote student to their next class. Current marks and fees will reset and be archived in history.
                      </Text>
                      <View style={styles.promotionForm}>
                        <Text style={styles.promoLabel}>New Class</Text>
                        <TextInput
                          style={styles.promoInput}
                          placeholder="New Class (1-7)"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                          value={promoStandard}
                          onChangeText={setPromoStandard}
                        />
                        <TouchableOpacity style={[styles.promoteBtn, { marginTop: 5 }]} onPress={handlePromoteStudent}>
                          <Ionicons name="trending-up" size={18} color={colors.background} style={{ marginRight: 6 }} />
                          <Text style={styles.promoteBtnText}>Promote Student</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.ScrollView>
                </View>
              );
                    }

            // tab === 'history'
            return (
              <View key="history" style={styles.page}>
                <Animated.ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  <View style={styles.innerSection}>
                    <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Academic History</Text>
                    {(history || []).length === 0 ? (
                      <View style={styles.emptyHistory}>
                        <Ionicons name="file-tray-outline" size={40} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No archived records available for this student.</Text>
                      </View>
                    ) : (
                      (history || []).map((record, index) => {
                        const historyTotalFees = (record.fees?.first || 0) + (record.fees?.second || 0) + (record.fees?.third || 0) + (record.fees?.fourth || 0);
                        const movedDate = new Date(record.movedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });
                        // Compute academic totals for this history record
                        const sumRecordMarks = (term: keyof SubjectMark): number | null => {
                          let hasAny = false;
                          const sum = (record.subjects || []).reduce((acc, sub) => {
                            const val = record.marks?.[sub]?.[term];
                            if (val !== null && val !== undefined) {
                              hasAny = true;
                              return acc + val;
                            }
                            return acc;
                          }, 0);
                          return hasAny ? sum : null;
                        };
                      
                        const recordTotalQuarter = sumRecordMarks('quarter');
                        const recordTotalHalfYear = sumRecordMarks('halfYear');
                        const recordTotalAnnual = sumRecordMarks('annual');


                        return (
                          <View key={index} style={styles.historyCard}>
                            <View style={styles.historyCardHeader}>
                              <Text style={styles.historyCardTitle}>Class {record.standard}</Text>
                              <Text style={styles.historyCardDate}>{movedDate}</Text>
                            </View>
                            <Text style={styles.historySubTitle}>Academic Scores</Text>
                            <View style={styles.historyTable}>
                              <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.colSubject, styles.headerText]}>Subject</Text>
                                <Text style={[styles.colMark, styles.headerText]}>Term-1</Text>
                                <Text style={[styles.colMark, styles.headerText]}>Term-2</Text>
                                <Text style={[styles.colMark, styles.headerText]}>Term-3</Text>
                              </View>
                              {(record.subjects || []).map((sub) => {
                                const subMarks = record.marks?.[sub] || { quarter: null, halfYear: null, annual: null };
                                return (
                                  <View key={sub} style={styles.tableRow}>
                                    <Text style={styles.colSubject} numberOfLines={1}>{sub}</Text>
                                    <Text style={styles.colMark}>{subMarks.quarter !== null ? subMarks.quarter : '-'}</Text>
                                    <Text style={styles.colMark}>{subMarks.halfYear !== null ? subMarks.halfYear : '-'}</Text>
                                    <Text style={styles.colMark}>{subMarks.annual !== null ? subMarks.annual : '-'}</Text>
                                  </View>
                                );
                              })}
                              {/* TOTAL ROW */}
                              <View style={[styles.tableRow, { borderTopWidth: 1, borderTopColor: colors.textSecondary + '33' }]}>
                                <Text style={[styles.colSubject, { fontWeight: '700' }]} numberOfLines={1}>Total</Text>
                                <Text style={[styles.colMark, { fontWeight: '700' }]}>{recordTotalQuarter !== null ? recordTotalQuarter : '-'}</Text>
                                <Text style={[styles.colMark, { fontWeight: '700' }]}>{recordTotalHalfYear !== null ? recordTotalHalfYear : '-'}</Text>
                                <Text style={[styles.colMark, { fontWeight: '700' }]}>{recordTotalAnnual !== null ? recordTotalAnnual : '-'}</Text>
                              </View>
                            </View>
                            <View style={styles.historyFeesRow}>
                              <Text style={styles.historyFeesLabel}>Fees Paid for Class {record.standard}:</Text>
                              <Text style={styles.historyFeesVal}>₹{historyTotalFees.toLocaleString('en-IN')}</Text>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                </Animated.ScrollView>
              </View>
            );
          })}
        </PagerView>
      </View>
    </View>
  </KeyboardAvoidingView>
);
}