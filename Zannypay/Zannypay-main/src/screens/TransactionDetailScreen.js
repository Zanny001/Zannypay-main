import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrency, formatDate } from '../utils/format';

export default function TransactionDetailScreen({ route, navigation }) {
  const { txn } = route.params;
  const isCredit = txn.type === 'credit';
  const isInvoice = txn.type === 'invoice';
  // Support both NestJS database keys (createdAt) and local context state keys (date)
  const transactionTimestamp = txn.createdAt || txn.date;

  const statusLabel = txn.status
    ? txn.status.charAt(0).toUpperCase() + txn.status.slice(1)
    : 'Successful';
  const statusColor = txn.status === 'pending' ? '#F5A623' : txn.status === 'failed' ? colors.danger : colors.success;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Zannypay Receipt\nReference: ${txn.id}\nAmount: ${formatCurrency(txn.amount)}\nStatus: ${statusLabel}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: isInvoice ? '#E6F6FF' : isCredit ? '#E7F8ED' : '#F3EEFD' }]}>
            <Ionicons name="checkmark-circle" size={40} color={isInvoice ? '#00A3E0' : isCredit ? colors.success : colors.primary} />
          </View>
          <Text style={styles.receiptTitle}>Transaction Receipt</Text>
          <Text style={styles.amount}>{isInvoice ? '' : isCredit ? '+' : '-'}{formatCurrency(txn.amount)}</Text>
        </View> {/* FIXED: This correctly closes the header View now */}
        
        <View style={styles.divider} />

        <View style={styles.metaRow}><Text style={styles.label}>Type</Text><Text style={styles.value}>{txn.title}</Text></View>
        <View style={styles.metaRow}><Text style={styles.label}>Details</Text><Text style={styles.value}>{txn.subtitle || 'N/A'}</Text></View>
        <View style={styles.metaRow}><Text style={styles.label}>Date & Time</Text><Text style={styles.value}>{formatDate(transactionTimestamp)}</Text></View>
        <View style={styles.metaRow}><Text style={styles.label}>Reference ID</Text><Text style={[styles.value, { fontSize: 11 }]}>{txn.id}</Text></View>
        <View style={styles.metaRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, { color: statusColor, fontWeight: '700' }]}>{statusLabel}</Text></View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.shareText}>Share Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 16 },
  statusBadge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  receiptTitle: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  amount: { fontSize: 28, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  divider: { width: '100%', height: 1, backgroundColor: colors.border, marginVertical: 16, borderStyle: 'dashed' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 13 },
  value: { color: colors.textDark, fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 16 },
  shareBtn: { backgroundColor: colors.primary, flexDirection: 'row', width: '100%', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  shareText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  closeBtn: { marginTop: 16, padding: 8 },
  closeText: { color: colors.textMuted, fontWeight: '600' },
});
