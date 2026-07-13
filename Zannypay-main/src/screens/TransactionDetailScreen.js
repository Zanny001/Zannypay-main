import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionDetailScreen({ navigation }) {
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
            <Text style={styles.recipientName}>To KUDIRAT ELEBUTE</Text>
            <Text style={styles.amount}>₦2,000.00</Text>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#2ED573" />
              <Text style={styles.statusText}>Successful</Text>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineStep}>
              <View style={styles.dotActive} />
              <Text style={styles.stepTitle}>Payment successful</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.timelineStep}>
              <View style={styles.dotActive} />
              <Text style={styles.stepTitle}>Submitted to bank</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.timelineStep}>
              <View style={styles.dotActive} />
              <Text style={styles.stepTitle}>Received by bank</Text>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transfer Amount</Text>
              <Text style={styles.detailValue}>₦2,000.00</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={styles.detailValue}>₦0.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.detailValue}>KUDIRAT ELEBUTE</Text>
                <Text style={styles.subDetail}>Opay | 9053683551</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Session ID</Text>
              <Text style={styles.detailValue}>10003326071314555...</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completion Time</Text>
              <Text style={styles.detailValue}>Jul 13, 2026 3:55:59 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn}>
          <Ionicons name="document-text-outline" size={20} color="#6C5CE7" />
          <Text style={styles.footerBtnText}>View Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn}>
          <Ionicons name="alert-circle-outline" size={20} color="#6C5CE7" />
          <Text style={styles.footerBtnText}>Report a Dispute</Text>
        </TouchableOpacity>
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
  recipientName: { color: '#888', fontSize: 15, marginBottom: 8 },
  amount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2F24', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#2ED573', marginLeft: 6, fontSize: 12, fontWeight: 'bold' },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, paddingHorizontal: 10 },
  timelineStep: { alignItems: 'center', width: 80 },
  dotActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2ED573', marginBottom: 8 },
  stepTitle: { color: '#fff', fontSize: 10, textAlign: 'center' },
  line: { flex: 1, height: 2, backgroundColor: '#2ED573', marginTop: 6 },
  detailsList: { backgroundColor: '#111', padding: 15, borderRadius: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  detailLabel: { color: '#888', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  subDetail: { color: '#666', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 10 },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#1A1A1A', backgroundColor: '#0D0D0D' },
  footerBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15 },
  footerBtnText: { color: '#6C5CE7', fontSize: 15, fontWeight: 'bold', marginLeft: 8 }
});
