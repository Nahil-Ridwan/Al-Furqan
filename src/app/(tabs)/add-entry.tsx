import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addEntry } from '../../storage/coreCrud';
import { colors, globalStyles } from '../../styles/global';
import { GRADE_SUBJECTS } from '../../utility/subjectList';

export default function AddStudentScreen() {
  const [name, setName] = useState('');
  const [regno, setRegno] = useState('');
  const [mobile, setMobile] = useState('');
  const [standard, setStandard] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Subject management
  const [subjects, setSubjects] = useState<string[]>([]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access gallery is required to upload a profile image.');
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
        if (base64Str) {
          setProfileImage(`data:image/jpeg;base64,${base64Str}`);
        } else if (result.assets[0].uri) {
          setProfileImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picking error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  // Auto-assign subjects when class changes
  useEffect(() => {
    if (standard.trim() && !isNaN(Number(standard))) {
      const gradeNum = Number(standard);
      if (GRADE_SUBJECTS[gradeNum]) {
        setSubjects(GRADE_SUBJECTS[gradeNum]);
      } else {
        // If class doesn't exist in mapping, clear subjects
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  }, [standard]);

  const handleAddStudent = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter student name.');
      return;
    }
    if (!regno.trim() || isNaN(Number(regno))) {
      Alert.alert('Validation Error', 'Please enter a valid registration number.');
      return;
    }
    if (!mobile.trim() || isNaN(Number(mobile))) {
      Alert.alert('Validation Error', 'Please enter a valid mobile number.');
      return;
    }
    if (!standard.trim() || isNaN(Number(standard))) {
      Alert.alert('Validation Error', 'Please enter a valid class (1-7).');
      return;
    }
    
    const gradeNum = Number(standard);
    if (gradeNum < 1 || gradeNum > 7) {
      Alert.alert('Validation Error', 'Class must be between 1 and 7.');
      return;
    }
    
    if (subjects.length === 0) {
      Alert.alert('Validation Error', 'No subjects available for this class. Please check the class number.');
      return;
    }

    // Initialize blank marks mapping for the subjects
    const marksMapping = subjects.reduce((acc, sub) => {
      acc[sub] = { quarter: null, halfYear: null, annual: null };
      return acc;
    }, {} as any);

    try {
      await addEntry({
        name: name.trim(),
        regno: Number(regno),
        mobile: Number(mobile),
        standard: gradeNum,
        active: 'ACTIVE',
        profileImage,
        subjects,
        marks: marksMapping,
        fees: { first: 0, second: 0, third: 0, fourth: 0 },
        history: [],
      });
      // Reset state
      setName('');
      setRegno('');
      setMobile('');
      setStandard('');
      setProfileImage(null);
      setSubjects([]);


      Alert.alert('Success', 'Student record created successfully!');
      router.push('/');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save student record.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[globalStyles.title, { marginBottom: 20 }]}>Add Student</Text>

        {/* Profile Image Picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color={colors.primary} />
                <Text style={styles.avatarPlaceholderText}>Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {profileImage && (
            <TouchableOpacity onPress={() => setProfileImage(null)} style={styles.removeImageBtn}>
              <Text style={styles.removeImageTxt}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize='characters'
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="Register no"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={regno}
              onChangeText={setRegno}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="Class (1-7)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={standard}
              onChangeText={setStandard}
            />
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Mobile no"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={mobile}
          onChangeText={setMobile}
        />


        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleAddStudent}>
          <Text style={styles.submitBtnText}>Register Student</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  removeImageBtn: {
    marginTop: 8,
  },
  removeImageTxt: {
    color: colors.alert,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    marginLeft: 4
  },
  subjectsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: 'rgba(186, 141, 82, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  subjectsInfoText: {
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  noSubjectsMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  noSubjectsText: {
    color: colors.alert,
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});