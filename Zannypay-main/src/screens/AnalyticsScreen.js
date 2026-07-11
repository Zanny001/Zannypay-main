import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';
import Card from '../components/Card';

export default function AnalyticsScreen() {
  const { transactions, balance } = useWallet();

  // BillsScreen submits specific labels (Airtime, Data, Electricity, TV
  // Subscription, Water, Internet) rather than a generic "Bills" tag, so we
  // group anything that isn't a Transfer or Invoice under Bills & Utilities.
  const BILL_LABELS = ['Airtime', 'Data', 'Electricity', 'TV Subscription', 'Water', 'Internet', 'Bill Payment'];

  const categories = (transactions || []).reduce((acc, txn) => {
    if (txn.type !== 'debit') return acc; // only outflows count as "spend"
    const cat = txn.category || 'Other';
    const amt = Math.abs(parseFloat(txn.amount)) || 0;

    // The backend records transfers with a lowercase category ("transfer"),
    // while everything else (Bills, Savings, Flexi Credit) uses the
    // human-readable label as-is, so this comparison is case-insensitive.
    if (cat.toLowerCase() === 'transfer') acc.Transfer += amt;
    else if (BILL_LABELS.includes(cat)) acc.Bills += amt;
    else acc.Other += amt;

    return acc;
  }, { Transfer: 0, Bills: 0, Other: 0 });

  const invoicesIssued = (transactions || [])
    .filter((t) => t.category === 'Invoices')
    .reduce((sum, t) => sum + (Math.abs(parseFloat(t.amount)) || 0), 0);

  const totalSpent = categories.Transfer + categories.Bills + categories.Other;

  const spendData = [
    { name: 'Transfers', amount: categories.Transfer, color: colors.primary, icon: 'swap-horizontal' },
    { name: 'Bills & Utilities', amount: categories.Bills, color: '#FF7A00', icon: 'receipt-outline' },
    { name: 'Other', amount: categories.Other, color: '#8A8A8A', icon: 'ellipsis-horizontal-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Financial Insights</Text>
          <Text style={styles.subtitle}>Smart automatic spend tracking</Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Outflow This Month</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.summarySub}>Net Wallet Balance: {formatCurrency(balance)}</Text>
          {invoicesIssued > 0 && (
            <Text style={styles.summarySub}>Invoices Issued: {formatCurrency(invoicesIssued)}</Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Breakdown by Category</Text>
        
        {spendData.map((item, idx) => {
          const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
          return (
            <Card key={idx} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              <View style={styles.progressBackground}>
                <View style={[styles.progressBar, { width: `${Math.max(percentage, 2)}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={styles.percentageText}>{percentage.toFixed(1)}% of total outflow</Text>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  summaryCard: { padding: 20, backgroundColor: colors.textDark, alignItems: 'center', marginBottom: 24 },
  summaryLabel: { color: '#AAA', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 8 },
  summarySub: { color: '#00C2FF', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 16 },
  categoryCard: { padding: 16, marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryName: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  categoryAmount: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  progressBackground: { height: 8, backgroundColor: '#EFEFEF', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  percentageText: { fontSize: 12, color: colors.textMuted, marginTop: 8, textAlign: 'right' }
});
