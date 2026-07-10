import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency, formatDate } from '../utils/format';
import Card from '../components/Card';
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
  const { creditLimit, loan, requestLoan, repayLoan, balance } = useWallet();

  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(30);
  const [loading, setLoading] = useState(false);

  const [repayVisible, setRepayVisible] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayLoading, setRepayLoading] = useState(false);

  const hasActiveLoan = loan && !loan.repaid;

  const handleApply = async () => {
    if (!amount) {
      Alert.alert('Enter an amount', 'Choose or type an amount you would like to borrow.');
      return;
    }
    setLoading(true);
    const res = await requestLoan({ amount, termDays: term });
    setLoading(false);

    if (!res.ok) {
      Alert.alert('Application declined', res.error);
      return;
    }
    Alert.alert('Cash Disbursed 🎉', `${formatCurrency(amount)} has just landed in your wallet.`);
    setAmount('');
  };

  const handleRepay = async () => {
    setRepayLoading(true);
    const res = await repayLoan(repayAmount);
    setRepayLoading(false);

    if (!res.ok) {
      Alert.alert('Repayment failed', res.error);
      return;
    }
    setRepayVisible(false);
    setRepayAmount('');
    Alert.alert(res.loan.repaid ? 'Loan Fully Repaid 🎉' : 'Payment Received', 'Thank you for keeping your Flexi Credit in good standing.');
  };

  const owed = hasActiveLoan ? Math.max(loan.totalOwed - loan.amountRepaid, 0) : 0;
  const repaidPct = hasActiveLoan && loan.totalOwed > 0 ? (loan.amountRepaid / loan.totalOwed) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flexi Credit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <LinearGradient colors={gradients.loan} style={styles.heroCard}>
            <Text style={styles.heroLabel}>Your Credit Limit</Text>
            <Text style={styles.heroValue}>{formatCurrency(creditLimit)}</Text>
            <Text style={styles.heroSub}>Based on your Zannypay wallet activity</Text>
          </LinearGradient>
        </FadeInView>

        {hasActiveLoan ? (
          <FadeInView delay={80}>
            <Card style={styles.loanCard}>
              <View style={styles.loanTopRow}>
                <Text style={styles.loanTitle}>Active Loan</Text>
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>Due {formatDate(loan.dueDate).split(' · ')[0]}</Text>
                </View>
              </View>
              <Text style={styles.owedValue}>{formatCurrency(owed)}</Text>
              <Text style={styles.owedLabel}>Outstanding Balance</Text>
              <AnimatedProgressBar percentage={repaidPct} color={colors.accent} />
              <View style={styles.loanMetaRow}>
                <Text style={styles.loanMetaText}>Principal: {formatCurrency(loan.principal)}</Text>
                <Text style={styles.loanMetaText}>Fee: {formatCurrency(loan.fee)}</Text>
              </View>
              <GradientButton title="Repay Now" onPress={() => setRepayVisible(true)} style={{ marginTop: 18 }} />
            </Card>
          </FadeInView>
        ) : (
          <FadeInView delay={80}>
            <Card style={styles.applyCard}>
              <Text style={styles.sectionTitle}>Get Instant Cash</Text>
              <Text style={styles.sectionSub}>Flat {5}% fee · No paperwork · Repay anytime before the due date</Text>

              <View style={styles.chipsRow}>
                {AMOUNT_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, String(amount) === String(p) && styles.chipActive]}
                    onPress={() => setAmount(String(p))}
                  >
                    <Text style={[styles.chipText, String(amount) === String(p) && styles.chipTextActive]}>
                      {formatCurrency(p)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Or enter a custom amount</Text>
              <TextInput style={styles.input} placeholder="₦0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

              <Text style={styles.label}>Repayment Term</Text>
              <View style={styles.chipsRow}>
                {TERMS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, term === t.value && styles.chipActive]}
                    onPress={() => setTerm(t.value)}
                  >
                    <Text style={[styles.chipText, term === t.value && styles.chipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <GradientButton title="Get Cash Now" onPress={handleApply} loading={loading} variant="gold" style={{ marginTop: 24 }} />
            </Card>
          </FadeInView>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={repayVisible} transparent animationType="fade" onRequestClose={() => setRepayVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Repay Loan</Text>
            <Text style={styles.modalSubtitle}>
              Outstanding: {formatCurrency(owed)} · Wallet: {formatCurrency(balance)}
            </Text>
            <TextInput
              style={[styles.input, { textAlign: 'center', fontSize: 22 }]}
              placeholder="₦0.00"
              keyboardType="numeric"
              value={repayAmount}
              onChangeText={setRepayAmount}
              autoFocus
            />
            <GradientButton title="Confirm Repayment" onPress={handleRepay} loading={repayLoading} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setRepayVisible(false)}>
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
  scroll: { padding: 20 },
  heroCard: { borderRadius: 20, padding: 24, marginBottom: 20 },
  heroLabel: { color: 'rgba(26,21,35,0.7)', fontSize: 13, fontWeight: '600' },
  heroValue: { color: colors.textDark, fontSize: 32, fontWeight: '800', marginTop: 6 },
  heroSub: { color: 'rgba(26,21,35,0.6)', fontSize: 12, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 6 },
  sectionSub: { fontSize: 12, color: colors.textMuted, marginBottom: 18 },
  applyCard: { padding: 20 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 10, backgroundColor: '#fff' },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textDark, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#1A1523' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.textDark },
  loanCard: { padding: 20 },
  loanTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  loanTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  dueBadge: { backgroundColor: '#FFF3D6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dueBadgeText: { fontSize: 11, fontWeight: '700', color: colors.warning },
  owedValue: { fontSize: 28, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  owedLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 14 },
  loanMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  loanMetaText: { fontSize: 12, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontWeight: '600' },
});
