import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useAppMode } from '../storage/appModeContext';
import { getEntryById, updateEntry } from '../storage/coreCrud';
import { Entry, SubjectMark, TermFees } from '../storage/typeEntry';
import { colors, globalStyles } from '../styles/global';
import { styles } from '../styles/student';
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
  }, [student?.marks, student?.fees]);

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

  const { name, regno, mobile, standard, profileImage, subjects = [], marks = {}, fees, history = [] } = student;

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


const calculateTotal = (quarter: number | null, halfYear: number | null): number | null => {
  if (quarter !== null && halfYear !== null) {
    return quarter + halfYear;
  }
  return null;
};

  const handleMarkChange = (subject: string, term: keyof SubjectMark, val: string) => {
  // Don't allow editing of total field
  if (term === 'total') return;
  
  const trimmedVal = val.trim();
  
  // Allow clearing the field
  if (trimmedVal === '') {
    const currentSubjectMarks = marks[subject] || { quarter: null, halfYear: null, total: null };
    const updatedTermMarks = {
      ...currentSubjectMarks,
      [term]: null,
    };
    updatedTermMarks.total = calculateTotal(updatedTermMarks.quarter, updatedTermMarks.halfYear);
    
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

  const currentSubjectMarks = marks[subject] || { quarter: null, halfYear: null, total: null };
  
  // Create updated marks with the new value
  const updatedTermMarks = {
    ...currentSubjectMarks,
    [term]: parsed,
  };
  
  // Auto-calculate total
  updatedTermMarks.total = calculateTotal(updatedTermMarks.quarter, updatedTermMarks.halfYear);

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
              acc[sub] = { quarter: null, halfYear: null, total: null };
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
          
              

              Alert.alert('Success', `Student promoted to Class ${newGrade}!`);
              setTimeout(() => {
              setActiveTab('marks');
              }, 100);
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

      {/* Scrollable Top Content */}
      <ScrollView 
        style={{ flexGrow: 0 }}  // Don't take all space
        contentContainerStyle={{ paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHorizontalLayout}>
            {/* Left Side - Details Stacked Vertically */}
            <View style={styles.profileDetailsColumn}>
              <Text style={styles.studentName}>{name}</Text>
              
              <View style={styles.detailsStack}>
                <View style={styles.detailRow}>
                  <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>#{regno}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Class {standard}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{mobile}</Text>
                </View>
              </View>
            </View>

            {/* Right Side - Profile Image */}
            <TouchableOpacity 
              onPress={handleProfileImageChange} 
              disabled={isViewMode}
              style={styles.profileImageContainer}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                  <Text style={styles.avatarText}>
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              {!isViewMode && (
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color={colors.background} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
            setActiveTab(tabTypes[index]);
          }}        
>
          {tabTypes.map((tab) => {
            if (tab === 'marks') {
              return (
                <View key="marks" style={styles.page}>
                  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.innerSection}>
                      <Text style={styles.sectionTitle}>Exam Marks</Text>
                      {subjects.length === 0 ? (
                        <Text style={styles.emptyText}>No subjects currently assigned.</Text>
                      ) : (
                        subjects.map((subject) => {
                          const sMarks = marks[subject] || { quarter: null, halfYear: null, total: null };
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
                                  <Text style={styles.inputLabel}>Total</Text>
                                  <View style={[styles.scoreInput, styles.totalDisplay]}>
                                    <Text style={[styles.totalText, sMarks.total === null && styles.totalTextPlaceholder]}>
                                      {sMarks.total !== null ? sMarks.total : '-'}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          );
                        })
                      )}
                    </View>
                  </ScrollView>
                </View>
              );
                    }

            if (tab === 'fees') {
              return (
                <View key="fees" style={styles.page}>
                  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                  </ScrollView>
                </View>
              );
            }

            if (tab === 'promote') {
              return (
                <View key="promote" style={styles.page}>
                  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                  </ScrollView>
                </View>
              );
                    }

            // tab === 'history'
            return (
              <View key="history" style={styles.page}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                                <Text style={[styles.colMark, styles.headerText]}>Total</Text>
                              </View>
                              {(record.subjects || []).map((sub) => {
                                const subMarks = record.marks?.[sub] || { quarter: null, halfYear: null, total: null };
                                return (
                                  <View key={sub} style={styles.tableRow}>
                                    <Text style={styles.colSubject} numberOfLines={1}>{sub}</Text>
                                    <Text style={styles.colMark}>{subMarks.quarter !== null ? subMarks.quarter : '-'}</Text>
                                    <Text style={styles.colMark}>{subMarks.halfYear !== null ? subMarks.halfYear : '-'}</Text>
                                    <Text style={[styles.colMark, { fontWeight: 700 }]}>{subMarks.total !== null ? subMarks.total : '-'}</Text>
                                  </View>
                                );
                              })}
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
                </ScrollView>
              </View>
            );
          })}
        </PagerView>
      </View>
    </View>
  </KeyboardAvoidingView>
);
}