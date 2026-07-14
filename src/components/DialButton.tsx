import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, TouchableOpacity } from 'react-native';
import { Entry } from '../storage/typeEntry';
import { colors } from '../styles/global';

type DialButtonProps = {
  entry: Entry;
};

export default function DialButton({ entry }: DialButtonProps) {
  const handleDial = async () => {
    const phoneNumber = `tel:${entry.mobile}`;
    
    // Check if the device can handle the tel URL scheme
    const supported = await Linking.canOpenURL(phoneNumber);
    
    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      Alert.alert('Error', 'Phone dialer is not available on this device');
    }
  };

  return (
    <TouchableOpacity onPress={handleDial}>
      <Ionicons name='call-outline' size={26} color={colors.primary} />
    </TouchableOpacity>
  );
}