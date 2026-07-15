import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppMode } from '../storage/appModeContext';
import { deleteEntry, updateEntry } from '../storage/coreCrud';
import { Entry } from '../storage/typeEntry';
import { colors } from '../styles/global';
import CustomActionSheet from './ActionSheet';

import DialButton from './DialButton';
import { handleReport } from './ReportButton';
import WhatsappButton from './WhatsappButton';

type EntryItemProps = {
  student: Entry;
  onDelete: () => void;
};


export default function EntryItem({ student, onDelete }: EntryItemProps) {
  const { id, name, regno, mobile, standard, profileImage, subjects = [], fees } = student;
  const { mode } = useAppMode();
  const isViewMode = mode === 'view';
  
  const totalFees = (fees?.first || 0) + (fees?.second || 0) + (fees?.third || 0) + (fees?.fourth || 0);

  // ACTION SHEET
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [activeStatus, setactiveStatus] = useState<'ACTIVE' | 'REMOVED'>(
    student.active || 'ACTIVE'
  );

  // Sync with prop when it changes (from parent refreshes)
  useEffect(() => {
    setactiveStatus(student.active || 'ACTIVE');
  }, [student.active]);


  const handleLongPress = () => {
    setIsActionSheetVisible(true);
  };

  const handleDelete = async () => {
    setIsActionSheetVisible(false);
    await deleteEntry(id);
    onDelete();
  };

   const isActive = activeStatus === 'ACTIVE';

  const handleToggleActive = async () => {
  setIsActionSheetVisible(false);
  
   const newStatus: 'ACTIVE' | 'REMOVED' = activeStatus === 'ACTIVE' ? 'REMOVED' : 'ACTIVE';
    
    try {
      const updatedEntry: Entry = {
        ...student,
        active: newStatus,
      };
      
      await updateEntry(updatedEntry);
      
      // Update local state immediately
      setactiveStatus(newStatus);
      
      console.log(`${newStatus === 'ACTIVE' ? 'Activated' : 'Deactivated'} student:`, id);
      onDelete();
    } catch (error) {
      // Revert on error
       console.error('Error toggling student status:', error);
    }
};

  

  const handleClose = () => {
    setIsActionSheetVisible(false);
  };
  

  return (
    <>
    <TouchableOpacity
      style={[styles.container, !isActive && styles.inactiveContainer]}
      onLongPress={handleLongPress}
      onPress={() => router.push({ pathname: '/student', params: { id } })}
    >
      <View style={styles.row}>
        {/* Profile Image / Default Avatar */}
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}

        {/* Student Info */}  
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.regNo}>#{regno}</Text>
          </View>
          
          <View style={styles.detailRow}>
            
            <Text style={styles.detailText}>Class {standard}</Text>
            <Text style={styles.divider}>•</Text>
            
            <Text style={styles.detailText}>{mobile}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{subjects.length} Subjects</Text>
            </View>
            <View style={[styles.badge, styles.feeBadge]}>
              <Text style={[styles.badgeText, styles.feeBadgeText]}>
                Fees: ₹{totalFees.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action icon */}
        <View style={{ marginRight:4 }}><WhatsappButton entry={student}/></View>
        <View style={{ marginRight:2 }}><DialButton entry={student}/></View>
      </View>
    </TouchableOpacity>

    {/* Use the CustomActionSheet component */}
      <CustomActionSheet
        visible={isActionSheetVisible}
        title="Student Action"
        message={`Choose action for student "${name}"?`}
        onClose={handleClose}
        options={isViewMode ? [
          {
            text: 'SHARE',
            onPress: () =>  handleReport(student),
            variant: 'default',
            icon: 'newspaper-outline'
          },
          {
            text: 'Cancel',
            onPress: handleClose,
            variant: 'cancel',
          },
        ] : [
          {
            text: isActive ? 'DEACTIVATE' : 'ACTIVATE',
            onPress: handleToggleActive,
            variant: 'default',
            icon: isActive ? 'person-remove-outline' : 'person-add-outline'
          },
          {
            text: 'SHARE',
            onPress: () =>  handleReport(student),
            variant: 'default',
            icon: 'newspaper-outline'
          },
          {
            text: 'DELETE',
            onPress: handleDelete,
            variant: 'destructive',
            icon: 'trash-outline',
          },
          {
            text: 'Cancel',
            onPress: handleClose,
            variant: 'cancel',
          },
        ]}
      />
    
     </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3a3a5e',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '22',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    maxWidth: '75%',
  },
  regNo: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    color: 'rgba(255,255,255,0.2)',
    marginHorizontal: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  feeBadge: {
    backgroundColor: '#6bcb7722',
  },
  feeBadgeText: {
    color: '#6bcb77',
  },
  
  inactiveContainer: {
    opacity: 0.5,
    backgroundColor: colors.inactive, // More transparent
    borderColor: 'rgba(33, 32, 32, 0.2)',
  },
});

