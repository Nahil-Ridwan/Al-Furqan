import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/global';

export type ActionOption = {
  text: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'cancel';
  icon?: string;
};

type CustomActionSheetProps = {
  visible: boolean;
  title: string;
  message?: string;
  options: ActionOption[];
  onClose: () => void;
};

export default function CustomActionSheet({
  visible,
  title,
  message,
  options,
  onClose,
}: CustomActionSheetProps) {
  const handleOptionPress = (option: ActionOption) => {
    // Animate out first, then execute the option's action
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      option.onPress();
    });
  };

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      // Animate both values when becoming visible
      Animated.parallel([
        // Fade in the overlay
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Slide up the content
        Animated.spring(slideAnimation, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation values when hidden
      overlayOpacity.setValue(0);
      slideAnimation.setValue(300);
    }
  }, [visible]);

  const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to downward gestures
      return gestureState.dy > 20;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 50 || gestureState.vy > 0.5) {
        // Swiped down enough - close the action sheet
        handleClose();
      } else {
        // Spring back to original position
        Animated.spring(slideAnimation, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
      }
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        // Only allow downward movement
        slideAnimation.setValue(gestureState.dy);
      }
    },
  })
).current;

  // Separate cancel option from other options
  const cancelOption = options.find(opt => opt.variant === 'cancel');
  const actionOptions = options.filter(opt => opt.variant !== 'cancel');

  return (
    <Modal
      animationType="none" // Disable default animation
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      {/* Animated Overlay - Fades in/out */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: overlayOpacity }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          {/* Animated Content - Slides up/down */}
          <Animated.View 
  style={[
    styles.actionSheetContainer,
    { transform: [{ translateY: slideAnimation }] }
  ]}
  {...panResponder.panHandlers}  // Add this line
>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()} // Prevent closing when tapping inside
            >
              <View style={styles.dragIndicator} />
              <Text style={styles.title}>{title}</Text>
              
              {message && <Text style={styles.subtitle}>{message}</Text>}

              {/* Action buttons in a row */}
              <View style={styles.actionButtonsRow}>
                {actionOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      option.variant === 'destructive' && styles.deleteButton,
                    ]}
                    onPress={() => handleOptionPress(option)}
                  >
                    {option.icon && (
                     <Ionicons 
                       name={option.icon as any} 
                       size={22} 
                       color={option.variant === 'destructive' ? '#FF3B30' : '#FFFFFF'} 
                       style={styles.actionIcon}
                     />
                    )}

                    <Text
                      style={[
                        styles.actionButtonText,
                        option.variant === 'destructive' && styles.deleteText,
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                    >
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Cancel button in separate row */}
              {cancelOption && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleClose()}
                >
                  <Text style={styles.cancelButtonText}>{cancelOption.text}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
   overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: colors.popup,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: 'rgba(255,255,255,0.6)',
  },

  
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  deleteText: {
    color: '#FF3B30',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },

  // Add this new style:
actionButtonsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 10,
},

// Update actionButton style:
actionButton: {
  flex: 1,
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: 1, // Makes buttons square
  minHeight: 80, // Minimum height to maintain shape
},

// Update actionButtonText style:
actionButtonText: {
  fontSize: 13, // Changed from 16
  fontWeight: '600',
  color: '#FFFFFF',
  textAlign: 'center',
},

actionIcon: {
  marginBottom: 6,
},

// Add this style:
dragIndicator: {
  width: 40,
  height: 4,
  backgroundColor: 'rgba(255,255,255,0.3)',
  borderRadius: 2,
  alignSelf: 'center',
  marginBottom: 15,
  marginTop:11,
},
});