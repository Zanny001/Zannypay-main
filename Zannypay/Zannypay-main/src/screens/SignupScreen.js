import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useWallet();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSignup = async () => {
    if (!name || !phone || pin.length !== 4) {
      Alert.alert('Missing info', 'Please fill your name, phone, and a 4-digit PIN.');
      return;
    }
    // The backend stores email as a required, unique column, so — despite
    // this field's original "optional" styling — a valid address is
    // actually mandatory for the account to be created successfully.
    if (!email || !isValidEmail(email)) {
      Alert.alert('Email required', 'Please enter a valid email address to finish creating your account.');
      return;
    }
    setLoading(true);
    const res = await signup({ name, email, phone, pin });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Sign up failed', res.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Create your Zannypay account</Text>
          <Text style={styles.subtitle}>It takes less than a minute.</Text>

          <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Create 4-digit PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={4} secureTextEntry />

          <GradientButton title="Create Account" onPress={handleSignup} loading={loading} style={{ marginTop: 12 }} />

          {/* NEW: Navigation to Login for existing users */}
          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 28 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: colors.border,
  },
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { color: colors.textMuted, fontSize: 14 },
  loginTextBold: { color: colors.primary, fontWeight: '700' },
});
