import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';

const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'Kuda', 'Opay', 'Palmpay'];

export default function TransferScreen({ navigation, route }) {
  const { balance, transferMoney } = useWallet();
  const [transferType, setTransferType] = useState('internal'); // 'internal' | 'external'
  const [account, setAccount] = useState('');
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  
  // Modals and Loading States
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Elite Modules (v2) — prefill from a saved Beneficiary, if navigated with params
  React.useEffect(() => {
    const params = route?.params;
    if (params?.prefillAccount) {
      setAccount(params.prefillAccount);
      if (params.prefillBank) {
        setBank(params.prefillBank);
        setTransferType('external');
      } else {
        setTransferType('internal');
      }
    }
  }, [route?.params]);

  const handleInitiateTransfer = () => {
    if (!account || !amount) {
      Alert.alert('Missing Info', 'Please enter an account number and amount.');
      return;
    }
    if (transferType === 'external' && !bank) {
      Alert.alert('Missing Info', 'Please select a destination bank.');
      return;
    }
    if (parseFloat(amount) > balance) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this transfer.');
      return;
    }
    setShowPinModal(true); // Open PIN confirmation
  };

  const handleConfirmTransfer = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit transaction PIN.');
      return;
    }

    setLoading(true);
    const res = await transferMoney({
      recipientAccount: account,
      bank: transferType === 'internal' ? 'Zannypay' : bank,
      amount,
      note,
      pin
    });
    setLoading(false);
    setShowPinModal(false);
    setPin('');

    if (!res.ok) {
      Alert.alert('Transfer Failed', res.error);
      return;
    }

    Alert.alert('Transfer Successful', `Sent ${formatCurrency(amount)} to ${account}.`, [
      { text: 'View Receipt', onPress: () => navigation.navigate('TransactionDetail', { txn: res.txn }) },
      { text: 'Done', onPress: () => navigation.navigate('Main') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.balanceText}>Available: <Text style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(balance)}</Text></Text>

        <View style={styles.segmentControl}>
          <TouchableOpacity 
            style={[styles.segmentBtn, transferType === 'internal' && styles.segmentActive]}
            onPress={() => setTransferType('internal')}
          >
            <Text style={[styles.segmentText, transferType === 'internal' && styles.segmentTextActive]}>To Zannypay</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentBtn, transferType === 'external' && styles.segmentActive]}
            onPress={() => setTransferType('external')}
          >
            <Text style={[styles.segmentText, transferType === 'external' && styles.segmentTextActive]}>Other Banks</Text>
          </TouchableOpacity>
        </View>

        {transferType === 'external' && (
          <>
            <Text style={styles.label}>Select Bank</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowBankDropdown(!showBankDropdown)}>
              <Text style={{ color: bank ? colors.textDark : colors.textMuted }}>{bank || 'Choose a bank'}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {showBankDropdown && (
              <View style={styles.dropdownList}>
                {BANKS.map((b) => (
                  <TouchableOpacity 
                    key={b} 
                    style={styles.dropdownItem} 
                    onPress={() => { setBank(b); setShowBankDropdown(false); }}
                  >
                    <Text style={styles.dropdownItemText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={styles.label}>Account Number</Text>
        <TextInput 
          style={styles.input} 
          placeholder="0000000000" 
          keyboardType="number-pad" 
          value={account} 
          onChangeText={setAccount} 
          maxLength={10} 
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput 
          style={styles.input} 
          placeholder="₦0.00" 
          keyboardType="numeric" 
          value={amount} 
          onChangeText={setAmount} 
        />

        <Text style={styles.label}>Add a Note (Optional)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="What is this for?" 
          value={note} 
          onChangeText={setNote} 
        />

        <GradientButton title="Next" onPress={handleInitiateTransfer} style={{ marginTop: 30 }} />
      </ScrollView>

      {/* PIN Confirmation Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Transfer</Text>
            <Text style={styles.modalSubtitle}>You are sending <Text style={{fontWeight:'700', color:colors.textDark}}>{formatCurrency(amount)}</Text> to {account}</Text>
            
            <TextInput 
              style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]} 
              placeholder="••••" 
              keyboardType="number-pad" 
              secureTextEntry 
              maxLength={4} 
              value={pin} 
              onChangeText={setPin} 
              autoFocus
            />

            <GradientButton title="Confirm & Send" onPress={handleConfirmTransfer} loading={loading} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPinModal(false); setPin(''); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  scroll: { padding: 24 },
  balanceText: { textAlign: 'center', fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  segmentControl: { flexDirection: 'row', backgroundColor: '#EAE5F5', borderRadius: 12, padding: 4, marginBottom: 24 },
  segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  segmentTextActive: { color: colors.primary },
  label: { fontSize: 13, color: colors.textDark, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: colors.border },
  dropdownList: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginTop: 8, maxHeight: 150 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemText: { fontSize: 15, color: colors.textDark },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  cancelBtn: { marginTop: 16, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 15 },
});
