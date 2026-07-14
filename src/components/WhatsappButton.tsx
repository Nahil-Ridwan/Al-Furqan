import { Ionicons } from '@expo/vector-icons';
import { Linking, TouchableOpacity } from 'react-native';
import { Entry } from '../storage/typeEntry';
import { colors } from '../styles/global';

type WhatsappButtonProps = {
  entry: Entry;
};

export default function WhatsappButton({ entry }: WhatsappButtonProps) {
  const handleWhatsapp = async () => {
  const phone = String(entry.mobile).replace(/\D/g, '');
  
  const WhatsappUrl = `https://wa.me/91${phone}`;
    
  await Linking.openURL(WhatsappUrl);
    
};

  return (
    <TouchableOpacity onPress={handleWhatsapp}>
      <Ionicons name='logo-whatsapp' size={27} color={colors.primary} />
    </TouchableOpacity>
  );
} 