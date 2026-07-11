import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function LoanScreen({ navigation }) {
  const theme = colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Finance</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Exclusive Loan Offer */}
        <View style={[styles.offerCard, { backgroundColor: theme.surfaceAlt }]}>
          <View style={[styles.offerBadge, { backgroundColor: theme.accent }]}>
            <Text style={styles.offerBadgeText}>Your Exclusive Loan Offer</Text>
          </View>
          <View style={styles.offerContent}>
            <View style={styles.offerHeader}>
              <MaterialCommunityIcons name="wallet-giftcard" size={22} color={theme.success} />
              <Text style={[styles.offerTitle, { color: theme.text }]}>Installment Loan</Text>
            </View>
            <View style={styles.offerDetails}>
              <View>
                <Text style={[styles.label, { color: theme.textMuted }]}>Loanable Amount</Text>
                <Text style={[styles.amount, { color: theme.text }]}>₦261,900</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Daily Interest</Text>
                <Text style={[styles.amount, { color: theme.success }]}>0.5%</Text>
              </View>
            </View>
            <Text style={[styles.periodText, { color: theme.textMuted }]}>
              Flexible loan period <Text style={{ color: theme.accent, fontWeight: '700' }}>from 30 to 60 days</Text>
            </Text>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.buttonText}>Borrow Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>More Loan Options</Text>

        {/* Cash Loan */}
        <View style={[styles.secondaryCard, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="cash-fast" size={22} color={theme.success} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Cash Loan</Text>
          </View>
          <View style={styles.cardRow}>
            <View>
              <Text style={[styles.label, { color: theme.textMuted }]}>Loanable Amount</Text>
              <Text style={[styles.subAmount, { color: theme.text }]}>₦24,800</Text>
              <Text style={[styles.periodText, { color: theme.textMuted, fontSize: 12 }]}>
                Loan period up to <Text style={{ color: theme.success, fontWeight: '700' }}>38 days</Text>
              </Text>
            </View>
            <View style={styles.rightAlign}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Daily Interest</Text>
              <Text style={[styles.subAmount, { color: theme.success }]}>1.2%</Text>
              <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.secondaryButtonText}>Borrow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Business Loan */}
        <View style={[styles.secondaryCard, { backgroundColor: theme.surface, marginBottom: 40 }]}>
           <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="briefcase" size={22} color={theme.info} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Business Loan</Text>
          </View>
          <View style={styles.cardRow}>
            <View>
              <Text style={[styles.label, { color: theme.textMuted }]}>Loanable Amount up to</Text>
              <Text style={[styles.subAmountLarge, { color: theme.info }]}>₦10,000,000</Text>
            </View>
            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.secondaryButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  offerTitle: { fontSize: 18, fontWeight: '800', marginLeft: 10 },
  offerDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '600' },
  amount: { fontSize: 28, fontWeight: '800' },
  periodText: { fontSize: 13, marginBottom: 25 },
  primaryButton: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 30, marginBottom: 15 },
  secondaryCard: { borderRadius: 20, padding: 20, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginLeft: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  subAmount: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  subAmountLarge: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  rightAlign: { alignItems: 'flex-end' },
  secondaryButton: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 24, marginTop: 10 },
  secondaryButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
