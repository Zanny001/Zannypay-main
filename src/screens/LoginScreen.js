import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { SecureStorage } from '../services/SecureStorage';

const BIOMETRIC_PHONE_KEY = 'zannypay_biometric_phone';
const biometricPinKey = (phone) => `zannypay_biometric_pin_${phone}`;

export default function LoginScreen({ navigation }) {
  const { user, login } = useWallet();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (digit) => {
    if (pin.length >= 4 || loading) return;
    setPin((prev) => prev + digit);
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometricAuth = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return Alert.alert('Error', 'Biometrics not supported on this device.');

    // Biometrics only ever unlock a PIN that was explicitly saved on this
    // device from Profile > Biometric Login — never a guessed/default PIN.
    const savedPhone = phone.trim() || (await SecureStorage.get(BIOMETRIC_PHONE_KEY));
    if (!savedPhone) {
      Alert.alert('Not Set Up', 'Enable Biometric Login from Settings after your first PIN login.');
      return;
    }
    const savedPin = await SecureStorage.get(biometricPinKey(savedPhone));
    if (!savedPin) {
      Alert.alert('Not Set Up', 'Enable Biometric Login from Settings after your first PIN login.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login to Zannypay',
      fallbackLabel: 'Use PIN',
    });

    if (result.success) {
      if (!phone.trim()) setPhone(savedPhone);
      setPin(savedPin); // Triggers the useEffect login with the real PIN
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (!phone.trim()) {
        Alert.alert('Missing Info', 'Please enter your phone number first.');
        setPin('');
        return;
      }

      const triggerLogin = async () => {
        setLoading(true);
        const res = await login(phone, pin);
        setLoading(false);
        if (!res.ok) {
          Alert.alert('Login failed', res.error);
          setPin('');
        }
      };
      
      triggerLogin();
    }
  }, [pin, phone, login]); // <--- UPGRADED: Added missing dependencies

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
        <Text style={styles.subtitle}>Enter your phone number and PIN</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number (e.g. 08012345678)"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={15}
          editable={!loading}
        />
      </View>

      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','bio','0','del'].map((key, i) => {
          if (key === 'bio') {
            return (
              <TouchableOpacity key={i} style={styles.key} onPress={handleBiometricAuth} disabled={loading}>
                <Ionicons name={Platform.OS === 'ios' ? "faceid" : "finger-print"} size={28} color={colors.primary} />
              </TouchableOpacity>
            );
          }
          if (key === 'del') {
            return (
              <TouchableOpacity key={i} style={styles.key} onPress={handleDelete} disabled={loading}>
                <Ionicons name="backspace-outline" size={26} color={colors.textDark} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={i} style={styles.key} onPress={() => handleKeyPress(key)} disabled={loading}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={{ marginTop: 24, alignSelf: 'center' }} onPress={() => navigation.replace('Signup')}>
        <Text style={{ color: colors.primary, fontWeight: '600' }}>No account yet? Sign up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingHorizontal: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  inputContainer: { width: '100%', marginBottom: 30, alignItems: 'center' },
  input: {
    width: '90%', height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16,
    fontSize: 16, color: colors.textDark, borderWidth: 1, borderColor: '#eee', textAlign: 'center',
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.primary, marginHorizontal: 8 },
  dotFilled: { backgroundColor: colors.primary },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: { width: '30%', aspectRatio: 1.4, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 26, fontWeight: '600', color: colors.textDark },
});
