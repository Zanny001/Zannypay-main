import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loan</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Exclusive Loan Offer */}
        <View style={styles.offerCard}>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>Your Exclusive Loan Offer</Text>
          </View>
          <View style={styles.offerContent}>
            <View style={styles.offerHeader}>
              <MaterialCommunityIcons name="wallet-giftcard" size={20} color="#00D2FF" />
              <Text style={styles.offerTitle}>Installment Loan</Text>
            </View>
            <View style={styles.offerDetails}>
              <View>
                <Text style={styles.label}>Loanable Amount</Text>
                <Text style={styles.amount}>₦261,900</Text>
              </View>
              <View>
                <Text style={styles.label}>Daily Interest</Text>
                <Text style={styles.amount}>0.5%</Text>
              </View>
            </View>
            <Text style={styles.periodText}>Flexible loan period <Text style={styles.highlightText}>from 30 days to 60 days</Text></Text>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>Borrow</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>More Loans</Text>

        {/* Cash Loan */}
        <View style={styles.secondaryCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="cash-fast" size={20} color="#00D2FF" />
            <Text style={styles.cardTitle}>Cash Loan</Text>
          </View>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.label}>Loanable Amount</Text>
              <Text style={styles.subAmount}>₦24,800</Text>
              <Text style={styles.periodText}>Loan period up to <Text style={styles.highlightText}>38 days</Text></Text>
            </View>
            <View style={styles.rightAlign}>
              <Text style={styles.label}>Daily Interest</Text>
              <Text style={styles.subAmount}>1.2%</Text>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.buttonText}>Borrow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Business Loan */}
        <View style={styles.secondaryCard}>
           <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="briefcase" size={20} color="#00D2FF" />
            <Text style={styles.cardTitle}>Business Loan</Text>
          </View>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.label}>Loanable Amount up to</Text>
              <Text style={styles.subAmountLarge}>₦10,000,000</Text>
            </View>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15 },
  scrollContainer: { paddingHorizontal: 20 },
  offerCard: { backgroundColor: '#1E1E24', borderRadius: 16, marginTop: 10, position: 'relative' },
  offerBadge: { backgroundColor: '#D4AF37', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingVertical: 8, alignItems: 'center' },
  offerBadgeText: { color: '#4A3B00', fontWeight: 'bold', fontSize: 12 },
  offerContent: { padding: 20 },
  offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  offerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  offerDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: '#A0A0A0', fontSize: 12, marginBottom: 4 },
  amount: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  periodText: { color: '#FFF', fontSize: 13, marginBottom: 20 },
  highlightText: { color: '#FF9900' },
  primaryButton: { backgroundColor: '#6236FF', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  secondaryCard: { backgroundColor: '#1E1E24', borderRadius: 16, padding: 20, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  subAmount: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subAmountLarge: { color: '#9D85FF', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  rightAlign: { alignItems: 'flex-end' },
  secondaryButton: { backgroundColor: '#6236FF', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 24, marginTop: 10 },
});
