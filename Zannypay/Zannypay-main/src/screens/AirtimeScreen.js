import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';
import GradientButton from '../components/GradientButton';

const AMOUNTS = ['100', '200', '500', '1000', '2000', '5000'];
const PROVIDERS = ['MTN', 'Airtel', 'Glo', '9mobile'];

export default function AirtimeScreen({ navigation }) {
  const theme = colors.dark;
  const { buyAirtime } = useWallet();
  const [activeTab, setActiveTab] = useState('Airtime');
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopup = () => {
    if (!phone || !amount) {
      Alert.alert('Details Required', 'Please enter a phone number and select an amount.');
      return;
    }
    setPin('');
    setPinModalVisible(true);
  };

  const handleConfirmPurchase = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit transaction PIN.');
      return;
    }
    setLoading(true);
    const res = await buyAirtime({
      phone,
      amount,
      provider,
      pin,
      isData: activeTab === 'Data Bundle',
    });
    setLoading(false);
    setPinModalVisible(false);
    setPin('');

    if (!res.ok) {
      Alert.alert('Purchase failed', res.error);
      return;
    }
    Alert.alert('Success', `${formatCurrency(amount)} ${activeTab} purchased for ${phone}.`, [
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mobile Top-up</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
          {['Airtime', 'Data Bundle'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: theme.surfaceAlt }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? theme.primary : theme.textMuted }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Provider Selector */}
        <Text style={[styles.label, { color: theme.textMuted }]}>Network Provider</Text>
        <View style={styles.providerRow}>
          {PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.providerChip, { borderColor: theme.border, backgroundColor: theme.surface }, provider === p && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setProvider(p)}
            >
              <Text style={{ color: provider === p ? '#fff' : theme.text, fontWeight: '600' }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Card */}
        <View style={[styles.inputCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textMuted, marginTop: 0 }]}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="0800 000 0000"
              placeholderTextColor={theme.border}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Ionicons name="person-circle" size={32} color={theme.primary} />
          </View>
        </View>

        {/* Amount Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Top-up Amount</Text>
        <View style={styles.grid}>
          {AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.gridItem,
                { backgroundColor: theme.surface, borderColor: amount === amt ? theme.primary : theme.border },
                amount === amt && { backgroundColor: 'rgba(98, 54, 255, 0.15)' }
              ]}
              onPress={() => setAmount(amt)}
            >
              <Text style={[styles.gridAmt, { color: amount === amt ? theme.primary : theme.text }]}>₦{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textMuted }]}>Or enter a custom amount</Text>
        <TextInput
          style={[styles.input, styles.customAmountInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          placeholder="₦0.00"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <GradientButton title="Pay Now" onPress={handleTopup} style={{ marginTop: 20 }} />
      </ScrollView>

      {/* PIN Confirmation Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={() => setPinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Purchase</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Buy {formatCurrency(amount)} {activeTab} for {phone} ({provider})?
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              autoFocus
            />
            <GradientButton title="Confirm & Pay" onPress={handleConfirmPurchase} loading={loading} style={{ marginTop: 20 }} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scroll: { padding: 20 },
  tabContainer: { flexDirection: 'row', borderRadius: 16, padding: 6, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap' },
  providerChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 10 },
  inputCard: { borderRadius: 20, padding: 20, marginTop: 6, marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 20, fontWeight: '800', padding: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '31%', borderWidth: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  gridAmt: { fontSize: 18, fontWeight: '800' },
  customAmountInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 20 },
});
