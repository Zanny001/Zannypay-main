import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import GradientButton from './GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function FundModal({ visible, onClose }) {
  const { user, fundWallet, syncWallet } = useWallet();

  // Localized state for a self-contained component
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('card'); // 'card' | 'bank'

  const handleCardFunding = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);
    const result = await fundWallet(amount);
    setLoading(false);

    if (result.ok && result.authorizationUrl) {
      // UPGRADE: Create a deep link return URL and use openAuthSessionAsync
      // This stops the browser from hanging on the JSON response screen.
      const returnUrl = Linking.createURL('payment-complete');
      
      await WebBrowser.openAuthSessionAsync(
        result.authorizationUrl,
        returnUrl
      );

      // Force a silent refresh in the background so the dashboard sees the new balance
      await syncWallet();

      // Clean up and close the modal
      setAmount('');
      onClose();
    } else {
      Alert.alert('Failed', result.error || 'Could not initialize payment.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Fund Wallet</Text>
          <Text style={styles.modalSubtitle}>Choose how you want to add money.</Text>

          {/* Funding Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodTab, method === 'card' && styles.activeTab]}
              onPress={() => setMethod('card')}
            >
              <Text style={method === 'card' ? styles.activeTabText : styles.tabText}>Card / Online</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodTab, method === 'bank' && styles.activeTab]}
              onPress={() => setMethod('bank')}
            >
              <Text style={method === 'bank' ? styles.activeTabText : styles.tabText}>Bank Transfer</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Content based on selection */}
          {method === 'card' ? (
            <View>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount (₦)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus={visible}
              />
              <GradientButton title="Proceed to Paystack" onPress={handleCardFunding} loading={loading} />
            </View>
          ) : (
            <View style={styles.bankContainer}>
              <Text style={styles.bankInstruction}>
                Transfer money to your dedicated virtual account. Your balance will update instantly.
              </Text>
              <View style={styles.accountCard}>
                <Text style={styles.bankName}>ZannyPay Virtual Bank</Text>
                <Text style={styles.accountNumber}>{user?.accountNumber || 'Generating...'}</Text>
                <Text style={styles.accountName}>{user?.name}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={{ marginTop: 24, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  modalSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },

  methodSelector: { flexDirection: 'row', backgroundColor: colors.bgLight, borderRadius: 12, padding: 4, marginBottom: 24 },
  methodTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  activeTabText: { color: colors.primary || '#5b21b6', fontWeight: 'bold' },

  modalInput: { backgroundColor: colors.bgLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 18, marginBottom: 18, borderWidth: 1, borderColor: colors.border },

  bankContainer: { marginBottom: 10 },
  bankInstruction: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 16 },
  accountCard: { backgroundColor: colors.primary || '#5b21b6', padding: 24, borderRadius: 16 },
  bankName: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  accountNumber: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  accountName: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
