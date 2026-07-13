import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, SectionList, Modal, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const historyData = [
  {
    title: 'July 2026',
    data: [
      { id: '1', type: 'send', title: 'Send - KUDIRAT AYOMIDE ELEBUTE', date: 'Jul 13, 2026 3:56 PM', amount: '-₦2,000.00', isCredit: false },
      { id: '2', type: 'interest', title: 'Trial Cash Interest', date: 'Jul 13, 2026 7:05 AM', amount: '+₦1.43', isCredit: true },
      { id: '3', type: 'interest', title: 'CashBox Interest', date: 'Jul 13, 2026 6:02 AM', amount: '+₦69.82', isCredit: true },
      { id: '4', type: 'interest', title: 'CashBox Auto Save', date: 'Jul 12, 2026 8:51 PM', amount: '+₦5,000.00', isCredit: true },
      { id: '5', type: 'receive', title: 'Received from Olarotimi Dukeola Mo...', date: 'Jul 12, 2026 8:51 PM', amount: '+₦5,000.00', isCredit: true },
      { id: '6', type: 'airtime', title: 'Top up Airtime', date: 'Jul 12, 2026 8:55 AM', amount: '-₦1,000.00', isCredit: false },
    ]
  }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUSES = ['All Status', 'Processing', 'Successful', 'Failed', 'Cancelled', 'Refunded'];

const CATEGORY_GROUPS = [
  { title: 'Money Flow', data: ['All', 'Money in', 'Money Out'] },
  { title: 'App', data: ['All', 'PalmPay', 'PalmPay Business'] },
  {
    title: 'Quick Filter',
    data: ['All Categories', 'Money Transfer', 'Add Money', 'Refund', 'Interbank Transfer', 'Withdraw']
  },
  {
    title: 'Bill Category',
    data: [
      'Top up Airtime', 'Buy Data Bundle', 'Betting', 'TV', 'Electricity', 'Water', 'Internet',
      'Dues & Service Charge', 'Lending Service', 'Associations & Societies', 'Event ticket',
      'Transportation & Tolls', 'Government Payments', 'Invoice Payments', 'Travel & Hotel',
      'Financial Institution', 'BankOne MFBs', 'Business Payments', 'Cowry Card', 'Religious',
      'Education', 'Palmpay Plus', 'Recharge2cash', 'JAMB', 'WAEC', 'Airtime Group Purchase', 'KekePay'
    ]
  },
  {
    title: 'Other',
    data: [
      'CashBox', 'Activity', 'CashIn', 'Cash Out', 'Merchants', 'Commission', 'Auto-deduct',
      'Repay loan', 'Lucky Money', 'Disbursement', 'Group Discount', 'Shopana', 'Online Shopping',
      'Commerce Retail Trade', 'Fixed Savings', 'Fixed Saving Payback', 'QR Code'
    ]
  }
];

export default function TransactionHistoryScreen({ navigation }) {
  const [selectedMonth, setSelectedMonth] = useState('Jul');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Modal Visibility States
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Filter Active Draft State (For Category Grid Options)
  const [activeCategoryDraft, setActiveCategoryDraft] = useState('All Categories');

  const getIcon = (type) => {
    switch(type) {
      case 'send': return <Ionicons name="arrow-up" size={18} color="#FF4757" />;
      case 'receive': return <Ionicons name="arrow-down" size={18} color="#2ED573" />;
      case 'interest': return <MaterialCommunityIcons name="piggy-bank" size={18} color="#7F5DF0" />;
      case 'airtime': return <Ionicons name="call" size={18} color="#1E90FF" />;
      default: return <Ionicons name="swap-horizontal" size={18} color="#fff" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('TransactionDetail', { txn: item })}>
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.isCredit ? '#2ED573' : '#FFF' }]}>
        {item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity>
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>

      {/* SEGMENT 1: MAIN FILTER LAYER */}
      <View style={styles.filterLayer}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setCategoryModalVisible(true)}>
          <Text style={styles.filterBtnText} numberOfLines={1}>{selectedCategory}</Text>
          <Ionicons name="funnel-outline" size={13} color="#888" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterBtn} onPress={() => setStatusModalVisible(true)}>
          <Text style={styles.filterBtnText}>{selectedStatus}</Text>
          <Ionicons name="chevron-down" size={14} color="#888" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* SEGMENT 2: MONTH & OVERVIEW LAYER */}
      <View style={styles.overviewLayer}>
        <View style={styles.monthContainer}>
          <TouchableOpacity style={styles.monthSelector} onPress={() => setMonthModalVisible(true)}>
            <Text style={styles.monthText}>{selectedMonth}</Text>
            <Ionicons name="caret-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <View style={styles.flowMetrics}>
            <Text style={styles.metricsLabel}>In <Text style={styles.metricsValue}>₦323,528.47</Text></Text>
            <Text style={styles.metricsLabel} style={{ marginLeft: 10 }}>Out <Text style={styles.metricsValue}>₦137,600.00</Text></Text>
          </View>
        </View>

        <TouchableOpacity style={styles.monthlyOverviewBtn}>
          <Ionicons name="wallet-outline" size={14} color="#7F5DF0" style={{ marginRight: 4 }} />
          <Text style={styles.monthlyOverviewText}>Monthly Overview</Text>
        </TouchableOpacity>
      </View>

      {/* TRANSACTION LIST */}
      <SectionList
        sections={historyData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 2. ALL CATEGORIES DROPDOWN MODAL */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
            <View style={styles.modalHeaderClose}>
              <Text style={styles.modalHeaderTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16 }}>
              {CATEGORY_GROUPS.map((group, gIdx) => (
                <View key={gIdx} style={styles.catGroupContainer}>
                  <Text style={styles.catGroupTitle}>{group.title}</Text>
                  <View style={styles.catChipGrid}>
                    {group.data.map((chip, cIdx) => {
                      const isSelected = activeCategoryDraft === chip;
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={[styles.catChip, isSelected && styles.catChipActive]}
                          onPress={() => setActiveCategoryDraft(chip)}
                        >
                          <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>{chip}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalFooterActions}>
              <TouchableOpacity style={styles.modalCancelAction} onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalCancelActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmAction} onPress={() => {
                setSelectedCategory(activeCategoryDraft);
                setCategoryModalVisible(false);
              }}>
                <Text style={styles.modalConfirmActionText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. MONTHS DROPDOWN MODAL */}
      <Modal visible={monthModalVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMonthModalVisible(false)}>
          <View style={[styles.modalContent, { maxHeight: 320, width: '80%', borderRadius: 16 }]}>
            <Text style={styles.modalSectionHeading}>Select Month</Text>
            <ScrollView>
              {MONTHS.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={styles.dropdownRow}
                  onPress={() => {
                    setSelectedMonth(month);
                    setMonthModalVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownRowText, selectedMonth === month && styles.dropdownRowTextActive]}>{month}</Text>
                  {selectedMonth === month && <Ionicons name="checkmark" size={18} color="#7F5DF0" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 4. ALL STATUS DROPDOWN MODAL */}
      <Modal visible={statusModalVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setStatusModalVisible(false)}>
          <View style={[styles.modalContent, { maxHeight: 360, width: '85%', borderRadius: 16 }]}>
            <Text style={styles.modalSectionHeading}>Filter by Status</Text>
            <ScrollView>
              {STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.dropdownRow}
                  onPress={() => {
                    setSelectedStatus(status);
                    setStatusModalVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownRowText, selectedStatus === status && styles.dropdownRowTextActive]}>{status}</Text>
                  {selectedStatus === status && <Ionicons name="checkmark" size={18} color="#7F5DF0" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  downloadText: { color: '#888', fontSize: 14, fontWeight: '600' },

  // Segment 1 Layout
  filterLayer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1A1A1A', paddingVertical: 12 },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  filterBtnText: { color: '#FFF', fontSize: 14, fontWeight: '500' },

  // Segment 2 Layout
  overviewLayer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  monthContainer: { flexDirection: 'column' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  monthText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  flowMetrics: { flexDirection: 'row', alignItems: 'center' },
  metricsLabel: { color: '#666', fontSize: 11, marginRight: 8 },
  metricsValue: { color: '#AAA', fontWeight: '600' },
  monthlyOverviewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1528', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  monthlyOverviewText: { color: '#7F5DF0', fontSize: 11, fontWeight: '700' },

  // List Layout
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#161616' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  itemDetails: { flex: 1, paddingRight: 8 },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemDate: { color: '#666', fontSize: 11 },
  itemAmount: { fontSize: 16, fontWeight: '700', textAlign: 'right' },

  // Global Modal & Dropdown Configurations
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#141414', width: '100%', overflow: 'hidden' },
  modalSectionHeading: { color: '#888', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222', letterSpacing: 0.5 },
  dropdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  dropdownRowText: { color: '#BBB', fontSize: 15, fontWeight: '500' },
  dropdownRowTextActive: { color: '#7F5DF0', fontWeight: '700' },

  // Categories Modal Specific Styles
  modalHeaderClose: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  modalHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  catGroupContainer: { marginTop: 16, marginBottom: 8 },
  catGroupTitle: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  catChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 2 },
  catChipActive: { backgroundColor: '#2C1B4D' },
  catChipText: { color: '#AAA', fontSize: 12, fontWeight: '500' },
  catChipTextActive: { color: '#7F5DF0', fontWeight: '700' },
  modalFooterActions: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#141414', borderTopWidth: 1, borderTopColor: '#222' },
  modalCancelAction: { flex: 1, backgroundColor: '#222', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelActionText: { color: '#AAA', fontSize: 15, fontWeight: '600' },
  modalConfirmAction: { flex: 1, backgroundColor: '#7F5DF0', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalConfirmActionText: { color: '#FFF', fontSize: 15, fontWeight: '700' }
});
