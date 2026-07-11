import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency, formatDate } from '../utils/format';
import GradientButton from '../components/GradientButton';
import AnimatedProgressBar from '../components/AnimatedProgressBar';
import FadeInView from '../components/FadeInView';

const AMOUNT_PRESETS = [10000, 25000, 50000, 100000];
const TERMS = [
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
];

export default function LoanScreen({ navigation }) {
  const theme = colors.dark;
  const { creditLimit, loan, requestLoan, repayLoan, balance } = useWallet();

  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(30);
  const [applying, setApplying] = useState(false);

  const [repayVisible, setRepayVisible] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayLoading, setRepayLoading] = useState(false);

  const hasActiveLoan = !!loan && !loan.repaid;

  const handleApply = async () => {
    if (!amount) {
      Alert.alert('Enter an amount', 'Choose or type an amount you would like to borrow.');
      return;
    }
    setApplying(true);
    const res = await requestLoan({ amount, termDays: term });
    setApplying(false);

    if (!res.ok) {
      Alert.alert('Application declined', res.error);
      return;
    }
    Alert.alert('Cash Disbursed', `${formatCurrency(amount)} has just landed in your wallet.`);
    setAmount('');
  };

  const handleRepay = async () => {
    if (!repayAmount) {
      Alert.alert('Enter an amount', 'Please enter how much you want to repay.');
      return;
    }
    setRepayLoading(true);
    const res = await repayLoan(repayAmount);
    setRepayLoading(false);

    if (!res.ok) {
      Alert.alert('Repayment failed', res.error);
      return;
    }
    setRepayVisible(false);
    setRepayAmount('');
    Alert.alert(
      res.loan.repaid ? 'Loan Fully Repaid' : 'Payment Received',
      'Thank you for keeping your Flexi Credit in good standing.'
    );
  };

  const principal = hasActiveLoan ? Number(loan.principal) || 0 : 0;
  const fee = hasActiveLoan ? Number(loan.fee) || 0 : 0;
  const totalOwed = hasActiveLoan ? Number(loan.totalOwed) || 0 : 0;
  const amountRepaid = hasActiveLoan ? Number(loan.amountRepaid) || 0 : 0;
  const owed = hasActiveLoan ? Math.max(totalOwed - amountRepaid, 0) : 0;
  const repaidPct = hasActiveLoan && totalOwed > 0 ? (amountRepaid / totalOwed) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Finance</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="headset-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <View style={[styles.offerCard, { backgroundColor: theme.surfaceAlt }]}>
            <View style={[styles.offerBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.offerBadgeText}>Your Flexi Credit Limit</Text>
            </View>
            <View style={styles.offerContent}>
              <View style={styles.offerHeader}>
                <MaterialCommunityIcons name="wallet-giftcard" size={22} color={theme.success} />
                <Text style={[styles.offerTitle, { color: theme.text }]}>{formatCurrency(creditLimit)}</Text>
              </View>
              <Text style={[styles.periodText, { color: theme.textMuted }]}>
                Based on your Zannypay wallet activity. Flat 5% fee, repay anytime before the due date.
              </Text>
            </View>
          </View>
        </FadeInView>

        {hasActiveLoan ? (
          <FadeInView delay={80}>
            <View style={[styles.secondaryCard, { backgroundColor: theme.surface, marginTop: 20 }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="cash-fast" size={22} color={theme.success} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Active Loan</Text>
                <View style={[styles.dueBadge, { backgroundColor: theme.border }]}>
                  <Text style={[styles.dueBadgeText, { color: theme.accent }]}>Due {formatDate(loan.dueDate).split(' · ')[0]}</Text>
                </View>
              </View>
              <Text style={[styles.owedValue, { color: theme.text }]}>{formatCurrency(owed)}</Text>
              <Text style={[styles.owedLabel, { color: theme.textMuted }]}>Outstanding Balance</Text>
              <AnimatedProgressBar percentage={repaidPct} color={theme.accent} trackColor={theme.border} />
              <View style={styles.loanMetaRow}>
                <Text style={[styles.loanMetaText, { color: theme.textMuted }]}>Principal: {formatCurrency(principal)}</Text>
                <Text style={[styles.loanMetaText, { color: theme.textMuted }]}>Fee: {formatCurrency(fee)}</Text>
              </View>
              <GradientButton title="Repay Now" onPress={() => setRepayVisible(true)} style={{ marginTop: 18 }} />
            </View>
          </FadeInView>
        ) : (
          <FadeInView delay={80}>
            <View style={[styles.secondaryCard, { backgroundColor: theme.surface, marginTop: 20 }]}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 6 }]}>Get Instant Cash</Text>
              <Text style={[styles.periodText, { color: theme.textMuted, marginBottom: 18 }]}>
                Pick an amount, choose a term, and it lands in your wallet immediately.
              </Text>

              <View style={styles.chipsRow}>
                {AMOUNT_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      String(amount) === String(p) && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}
                    onPress={() => setAmount(String(p))}
                  >
                    <Text style={[styles.chipText, { color: theme.text }, String(amount) === String(p) && { color: '#1A1523' }]}>
                      {formatCurrency(p)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textMuted }]}>Or enter a custom amount</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                placeholder="₦0.00"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={[styles.label, { color: theme.textMuted }]}>Repayment Term</Text>
              <View style={styles.chipsRow}>
                {TERMS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.chip,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      term === t.value && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}
                    onPress={() => setTerm(t.value)}
                  >
                    <Text style={[styles.chipText, { color: theme.text }, term === t.value && { color: '#1A1523' }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <GradientButton title="Borrow Now" onPress={handleApply} loading={applying} variant="gold" style={{ marginTop: 20 }} />
            </View>
          </FadeInView>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={repayVisible} transparent animationType="fade" onRequestClose={() => setRepayVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Repay Loan</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Outstanding: {formatCurrency(owed)} · Wallet: {formatCurrency(balance)}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, textAlign: 'center', fontSize: 22 }]}
              placeholder="₦0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={repayAmount}
              onChangeText={setRepayAmount}
              autoFocus
            />
            <GradientButton title="Confirm Repayment" onPress={handleRepay} loading={repayLoading} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setRepayVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 16 },
  scrollContainer: { paddingHorizontal: 20 },
  offerCard: { borderRadius: 20, marginTop: 10, position: 'relative' },
  offerBadge: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 8, alignItems: 'center' },
  offerBadgeText: { color: '#000', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  offerContent: { padding: 20 },
  offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  offerTitle: { fontSize: 26, fontWeight: '800', marginLeft: 10 },
  periodText: { fontSize: 13, lineHeight: 19 },
  secondaryCard: { borderRadius: 20, padding: 20, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginLeft: 10, flex: 1 },
  dueBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dueBadgeText: { fontSize: 11, fontWeight: '700' },
  owedValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  owedLabel: { fontSize: 12, marginBottom: 14 },
  loanMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  loanMetaText: { fontSize: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 10 },
  chipText: { fontWeight: '600', fontSize: 13 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600' },
});
