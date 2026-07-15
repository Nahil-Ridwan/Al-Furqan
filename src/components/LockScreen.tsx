import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppMode } from '../storage/appModeContext';
import { colors } from '../styles/global';

export default function LockScreen() {
  const { setMode } = useAppMode();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  

  const handleUnlock = () => {
    const trimmed = password.trim().toLowerCase();
    if (trimmed === 'view') {
      setMode('view');
    } else if (trimmed === 'edit') {
      setMode('edit');
    } else {
      setError('Invalid password. Try again.');
      setPassword('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Al-Furqan Portal</Text>
        <Text style={styles.subtitle}>Enter password for access</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Password"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError('');
          }}
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleUnlock}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleUnlock}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          forgot password ?  contact us
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    marginTop:25,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(191, 186, 168, 0.3)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 29,
    backgroundColor: 'rgba(191, 186, 168, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.alert,
  },
  errorText: {
    color: colors.alert,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
