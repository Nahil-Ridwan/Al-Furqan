// MacroCard.tsx
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../styles/global';

type StatsCardProps = {
  label: string;
  value: string;
  subtext: string;
  color: string;
  onPress?: () => void;
  icon?: React.ReactNode;  // Add icon prop
};

export default function StatsCard({
  label,
  value,
  subtext,
  color,
  onPress,
}: StatsCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: color }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtext}>{subtext}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#a0a0b0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 6,
  },
  subtext: {
    fontSize: 12,
    color: '#7a7a9a',
    marginTop: 4,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});