import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';

const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'Kuda', 'Opay', 'Palmpay'];

export default function TransferScreen({ navigation, route }) {
  const theme = colors.dark;
  const { balance, transferMoney } = useWallet();
  const [transferType, setTransferType] = useState('internal');
  const [account, setAccount] = useState('');
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setShowPinModal(true);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.balanceText, { color: theme.textMuted }]}>
          Available: <Text style={{ color: theme.success, fontWeight: '800' }}>{formatCurrency(balance)}</Text>
        </Text>

        <View style={[styles.segmentControl, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, transferType === 'internal' && { backgroundColor: theme.surfaceAlt }]}
            onPress={() => setTransferType('internal')}
          >
            <Text style={[styles.segmentText, { color: transferType === 'internal' ? theme.primary : theme.textMuted }]}>To Zannypay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, transferType === 'external' && { backgroundColor: theme.surfaceAlt }]}
            onPress={() => setTransferType('external')}
          >
            <Text style={[styles.segmentText, { color: transferType === 'external' ? theme.primary : theme.textMuted }]}>Other Banks</Text>
          </TouchableOpacity>
        </View>

        {transferType === 'external' && (
          <>
            <Text style={[styles.label, { color: theme.text }]}>Select Bank</Text>
            <TouchableOpacity 
              style={[styles.dropdownTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]} 
              onPress={() => setShowBankDropdown(!showBankDropdown)}
            >
              <Text style={{ color: bank ? theme.text : theme.textMuted, fontWeight: '600' }}>{bank || 'Choose a bank'}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
            </TouchableOpacity>

            {showBankDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {BANKS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                    onPress={() => { setBank(b); setShowBankDropdown(false); }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.text }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={[styles.label, { color: theme.text }]}>Account Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="0000000000"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          value={account}
          onChangeText={setAccount}
          maxLength={10}
        />

        <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="₦0.00"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: theme.text }]}>Add a Note (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="What is this for?"
          placeholderTextColor={theme.textMuted}
          value={note}
          onChangeText={setNote}
        />
        
        <GradientButton title="Next" onPress={handleInitiateTransfer} style={{ marginTop: 40 }} />
      </ScrollView>

      {/* PIN Confirmation Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surfaceAlt }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Transfer</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              You are sending <Text style={{fontWeight:'800', color: theme.success}}>{formatCurrency(amount)}</Text> to {account}
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.primary, color: theme.text, textAlign: 'center', fontSize: 24, letterSpacing: 12, marginTop: 10 }]}
              placeholder="••••"
              placeholderTextColor={theme.border}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              autoFocus
            />

            <GradientButton title="Confirm & Send" onPress={handleConfirmTransfer} loading={loading} style={{ marginTop: 25 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPinModal(false); setPin(''); }}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scroll: { padding: 24 },
  balanceText: { textAlign: 'center', fontSize: 14, marginBottom: 25, fontWeight: '600' },
  segmentControl: { flexDirection: 'row', borderRadius: 16, padding: 6, marginBottom: 25 },
  segmentBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  segmentText: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 20 },
  input: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, borderWidth: 1, fontWeight: '600' },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1 },
  dropdownList: { borderRadius: 16, borderWidth: 1, marginTop: 10, maxHeight: 180, overflow: 'hidden' },
  dropdownItem: { padding: 16, borderBottomWidth: 1 },
  dropdownItemText: { fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { fontSize: 15, textAlign: 'center', marginTop: 10, marginBottom: 25 },
  cancelBtn: { marginTop: 20, padding: 15, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 16 },
});
