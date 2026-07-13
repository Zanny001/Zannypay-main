import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrency, formatDate } from '../utils/format';

const STATUS_STEPS = {
  successful: ['Payment successful', 'Submitted to bank', 'Received by bank'],
  completed: ['Payment successful', 'Submitted to bank', 'Received by bank'],
  pending: ['Payment initiated', 'Processing', 'Awaiting confirmation'],
  failed: ['Payment failed', '\u2014', '\u2014'],
};

export default function TransactionDetailScreen({ route, navigation }) {
  const { txn } = route.params;

  // Prisma Decimal fields serialize as strings over JSON — always coerce with Number().
  const amount = Number(txn.amount ?? 0);
  const fee = Number(txn.fee ?? 0);

  const isCredit = txn.type === 'credit';
  const isInvoice = txn.type === 'invoice';

  // Support both NestJS database keys (createdAt) and local context state keys (date)
  const transactionTimestamp = txn.createdAt || txn.date;

  const rawStatus = (txn.status || 'successful').toLowerCase();
  const statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  const statusColor =
    rawStatus === 'pending' ? '#F5A623' : rawStatus === 'failed' ? colors.danger : colors.success;
  const statusDotColor = rawStatus === 'failed' ? colors.danger : rawStatus === 'pending' ? '#F5A623' : '#2ED573';

  const steps = STATUS_STEPS[rawStatus] || STATUS_STEPS.successful;

  const recipientName = txn.recipientName || txn.subtitle || 'N/A';
  const recipientBank = txn.recipientBank || txn.bank || null;
  const recipientAccount = txn.recipientAccountNumber || txn.accountNumber || null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Zannypay Receipt\nReference: ${txn.id}\nAmount: ${formatCurrency(amount)}\nStatus: ${statusLabel}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDispute = () => {
    Alert.alert(
      'Report a Dispute',
      'Are you sure you want to raise a dispute for this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Raise Dispute',
          style: 'destructive',
          onPress: () => {
            // TODO: wire this to a real backend endpoint once one exists
            // (there's currently no dispute route/model on the NestJS side).
            Alert.alert('Dispute Logged', 'Your dispute has been recorded. Our team will follow up shortly.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <Ionicons name="headset-outline" size={24} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.receiptCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.recipientName}>
              {isInvoice ? txn.title || 'Invoice' : `To ${recipientName}`}
            </Text>
            <Text style={styles.amount}>
              {isInvoice ? '' : isCredit ? '+' : '-'}
              {formatCurrency(amount)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
              <Ionicons
                name={rawStatus === 'failed' ? 'close-circle' : 'checkmark-circle'}
                size={14}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>

          {!isInvoice && (
            <View style={styles.timeline}>
              {steps.map((label, idx) => (
                <React.Fragment key={idx}>
                  <View style={styles.timelineStep}>
                    <View style={[styles.dot, { backgroundColor: statusDotColor }]} />
                    <Text style={styles.stepTitle}>{label}</Text>
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[styles.line, { backgroundColor: statusDotColor }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{isInvoice ? 'Invoice Amount' : 'Transfer Amount'}</Text>
              <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
            </View>
            {!isInvoice && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>{formatCurrency(fee)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            {!isInvoice && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.detailValue}>{recipientName}</Text>
                  {(recipientBank || recipientAccount) && (
                    <Text style={styles.subDetail}>
                      {[recipientBank, recipientAccount].filter(Boolean).join(' | ')}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference ID</Text>
              <Text style={[styles.detailValue, { fontSize: 11 }]}>{txn.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completion Time</Text>
              <Text style={styles.detailValue}>{formatDate(transactionTimestamp)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={handleShare}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.footerBtnText}>Share Receipt</Text>
        </TouchableOpacity>
        {!isInvoice && (
          <TouchableOpacity style={styles.footerBtn} onPress={handleDispute}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.footerBtnText}>Report a Dispute</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 20 },
  receiptCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20 },
  cardHeader: { alignItems: 'center', marginBottom: 30 },
  recipientName: { color: '#888', fontSize: 15, marginBottom: 8, textAlign: 'center' },
  amount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { marginLeft: 6, fontSize: 12, fontWeight: 'bold' },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, paddingHorizontal: 10 },
  timelineStep: { alignItems: 'center', width: 80 },
  dot: { width: 14, height: 14, borderRadius: 7, marginBottom: 8 },
  stepTitle: { color: '#fff', fontSize: 10, textAlign: 'center' },
  line: { flex: 1, height: 2, marginTop: 6 },
  detailsList: { backgroundColor: '#111', padding: 15, borderRadius: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  detailLabel: { color: '#888', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  subDetail: { color: '#666', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 10 },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#1A1A1A', backgroundColor: '#0D0D0D' },
  footerBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15 },
  footerBtnText: { color: '#6C5CE7', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
});

