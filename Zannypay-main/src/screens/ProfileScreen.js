import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Switch, ScrollView, Platform, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { SecureStorage } from '../services/SecureStorage';
import GradientButton from '../components/GradientButton';

const BIOMETRIC_PHONE_KEY = 'zannypay_biometric_phone';
const biometricPinKey = (phone) => `zannypay_biometric_pin_${phone}`;

export default function ProfileScreen() {
  const theme = colors.dark; // Inherit the dark mode theme
  const { user, logout } = useWallet();
  const navigation = useNavigation();
  
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [pushNotes, setPushNotes] = useState(true);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [setupPin, setSetupPin] = useState('');

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(compatible);
      if (user?.phone) {
        const savedPin = await SecureStorage.get(biometricPinKey(user.phone));
        setBiometricsEnabled(!!savedPin);
      }
    })();
  }, [user?.phone]);

  const handleToggleBiometrics = async (newValue) => {
    if (newValue) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Biometric Login for Zannypay',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        setSetupPin('');
        setPinModalVisible(true);
      } else {
        setBiometricsEnabled(false);
        Alert.alert('Authentication Failed', 'We could not verify your identity.');
      }
    } else {
      if (user?.phone) {
        await SecureStorage.remove(biometricPinKey(user.phone));
        await SecureStorage.remove(BIOMETRIC_PHONE_KEY);
      }
      setBiometricsEnabled(false);
    }
  };

  const confirmBiometricPinSetup = async () => {
    if (setupPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Enter your 4-digit transaction PIN to finish setup.');
      return;
    }
    if (!user?.phone) {
      Alert.alert('Error', 'No phone number on file for this account.');
      return;
    }
    await SecureStorage.save(BIOMETRIC_PHONE_KEY, user.phone);
    await SecureStorage.save(biometricPinKey(user.phone), setupPin);
    setPinModalVisible(false);
    setSetupPin('');
    setBiometricsEnabled(true);
    Alert.alert('Success', 'Biometric login is now enabled.');
  };

  const handleLogout = () => {
    Alert.alert('Secure Logout', 'Are you sure you want to end this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Modern 'Me' Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'Z')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'Zannypay Member'}</Text>
            <Text style={[styles.phone, { color: theme.textMuted }]}>{user?.phone || 'No Phone Linked'}</Text>
            <View style={styles.tierBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#00C48C" />
              <Text style={styles.tierText}>Verified · Tier 1</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.qrBtn, { backgroundColor: theme.surface }]}>
             <Ionicons name="qr-code" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>Security</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          {hasHardware && (
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.rowLeft}>
                <Ionicons name={Platform.OS === 'ios' ? "faceid" : "finger-print-outline"} size={20} color={theme.primary} />
                <Text style={[styles.menuLabel, { color: theme.text }]}>Biometric Login</Text>
              </View>
              <Switch 
                value={biometricsEnabled} 
                onValueChange={handleToggleBiometrics} 
                trackColor={{ true: theme.primary, false: theme.border }} 
              />
            </View>
          )}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color={theme.primary} />
              <Text style={[styles.menuLabel, { color: theme.text }]}>Push Alerts</Text>
            </View>
            <Switch 
              value={pushNotes} 
              onValueChange={setPushNotes} 
              trackColor={{ true: theme.primary, false: theme.border }} 
            />
          </View>
        </View>

        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>Features</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={[styles.clickableMenu, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Beneficiaries')}>
            <Ionicons name="people-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>Saved Recipients</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clickableMenu, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Savings')}>
            <Ionicons name="trending-up-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>Save & Grow</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clickableMenu, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Loans')}>
            <Ionicons name="cash-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>Flexi Credit</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>Support</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={[styles.clickableMenu, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>Help Center</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clickableMenu, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('DeveloperConsole')}>
            <Ionicons name="terminal-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>Developer Console</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={[styles.clickableMenu, { borderBottomWidth: 0 }]}>
            <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.text }]}>App Version</Text>
            <Text style={{ marginLeft: 'auto', color: theme.textMuted, fontSize: 13 }}>v2.0.0 (Dark)</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4B4B" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={[styles.footerText, { color: theme.textMuted }]}>Secured by Zannypay</Text>
      </ScrollView>

      {/* Biometric PIN confirmation Modal remains structurally the same, stylized dark */}
      <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={() => setPinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Your PIN</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>Link Face/Touch ID with your PIN.</Text>
            <TextInput
              style={[styles.pinInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={setupPin}
              onChangeText={setSetupPin}
              autoFocus
            />
            <GradientButton title="Confirm" onPress={confirmBiometricPinSetup} style={{ marginTop: 20 }} />
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setPinModalVisible(false)}>
              <Text style={{ color: theme.textMuted, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 25, marginTop: 10 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 24 },
  headerTextWrap: { flex: 1, marginLeft: 16 },
  name: { fontSize: 18, fontWeight: '700' },
  phone: { fontSize: 13, marginTop: 2, marginBottom: 6 },
  tierBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 196, 140, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tierText: { fontSize: 11, color: '#00C48C', fontWeight: '600', marginLeft: 4 },
  qrBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  
  sectionHeading: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8, marginTop: 10 },
  cardGroup: { marginHorizontal: 20, borderRadius: 16, paddingVertical: 4, marginBottom: 15 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  clickableMenu: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '500', marginLeft: 12 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(255, 75, 75, 0.1)', marginTop: 20 },
  logoutText: { color: '#FF4B4B', fontWeight: '700', marginLeft: 8 },
  footerText: { textAlign: 'center', fontSize: 11, marginTop: 16, marginBottom: 40 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  pinInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, letterSpacing: 8, textAlign: 'center', borderWidth: 1 },
});

