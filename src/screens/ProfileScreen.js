import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Switch, ScrollView, Platform, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { SecureStorage } from '../services/SecureStorage';
import GradientButton from '../components/GradientButton';
import Card from '../components/Card';

const BIOMETRIC_PHONE_KEY = 'zannypay_biometric_phone';
const biometricPinKey = (phone) => `zannypay_biometric_pin_${phone}`;

export default function ProfileScreen() {
  const { user, logout } = useWallet();
  const navigation = useNavigation();
  
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [pushNotes, setPushNotes] = useState(true);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [setupPin, setSetupPin] = useState('');

  // Check hardware on mount, and whether biometrics were already set up for this user
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
        // Ask the user to confirm their transaction PIN once, so it can be
        // stored securely on-device and used to unlock future biometric logins.
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

  const cancelPinSetup = () => {
    setPinModalVisible(false);
    setSetupPin('');
    setBiometricsEnabled(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'Z')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Zannypay Member'}</Text>
          <Text style={styles.phone}>{user?.phone || 'No Phone Linked'}</Text>
          <View style={styles.tierBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.success} />
            <Text style={styles.tierText}>Verified Account · Tier 1 Limit</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Security Configuration</Text>
        <Card style={styles.cardMargin}>
          {hasHardware && (
            <View style={styles.settingRow}>
              <View style={styles.rowLeft}>
                <Ionicons name={Platform.OS === 'ios' ? "faceid" : "finger-print-outline"} size={20} color={colors.primary} />
                <Text style={styles.menuLabel}>Biometric Login</Text>
              </View>
              <Switch 
                value={biometricsEnabled} 
                onValueChange={handleToggleBiometrics} 
                trackColor={{ true: colors.primary, false: colors.border }} 
              />
            </View>
          )}
          <View style={[styles.settingRow, !hasHardware && { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>Real-time Push Alerts</Text>
            </View>
            <Switch 
              value={pushNotes} 
              onValueChange={setPushNotes} 
              trackColor={{ true: colors.primary, false: colors.border }} 
            />
          </View>
        </Card>

        <Text style={styles.sectionHeading}>Financial Tools</Text>
        <Card style={styles.cardMargin}>
          <TouchableOpacity style={styles.clickableMenu} onPress={() => navigation.navigate('Beneficiaries')}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>Saved Recipients</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.clickableMenu} onPress={() => navigation.navigate('Savings')}>
            <Ionicons name="trending-up-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>Save & Grow</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clickableMenu, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Loans')}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>Flexi Credit</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionHeading}>Support & Infrastructure</Text>
        <Card style={styles.cardMargin}>
          <TouchableOpacity style={styles.clickableMenu} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>Help & Support Channels</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          {/* Integrated Developer Console Menu Item */}
          <TouchableOpacity style={styles.clickableMenu} onPress={() => navigation.navigate('DeveloperConsole')}>
            <Ionicons name="terminal-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>Developer Console</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <View style={[styles.clickableMenu, { borderBottomWidth: 0 }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>App Version</Text>
            <Text style={{ marginLeft: 'auto', color: colors.textMuted, fontSize: 13 }}>v1.0.0 (Production)</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Secure Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>Secured by Zannypay Infrastructure</Text>
      </ScrollView>

      {/* Biometric PIN confirmation — links Face/Touch ID to the account's real PIN */}
      <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={cancelPinSetup}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Your PIN</Text>
            <Text style={styles.modalSubtitle}>Enter your 4-digit transaction PIN once to link it to Face/Touch ID.</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={setupPin}
              onChangeText={setSetupPin}
              autoFocus
            />
            <GradientButton title="Confirm" onPress={confirmBiometricPinSetup} style={{ marginTop: 20 }} />
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={cancelPinSetup}>
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 26 },
  name: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  phone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7F8ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  tierText: { fontSize: 11, color: colors.success, fontWeight: '600', marginLeft: 4 },
  sectionHeading: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8, marginTop: 16 },
  cardMargin: { marginHorizontal: 20, paddingVertical: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  clickableMenu: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: 14, color: colors.textDark, fontWeight: '500', marginLeft: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: '#FEE2E2', marginTop: 32 },
  logoutText: { color: colors.danger, fontWeight: '700', marginLeft: 8 },
  footerText: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 16, marginBottom: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  pinInput: { backgroundColor: colors.bgLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, letterSpacing: 8, textAlign: 'center', borderWidth: 1, borderColor: colors.border },
});

