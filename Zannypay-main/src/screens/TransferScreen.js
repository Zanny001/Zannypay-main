import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';

const BANK_LIST = [
  'GTBank', 'Access Bank', 'OPay', 'Kuda MFB', 'Zenith Bank', 'First Bank Of Nigeria',
  'Wema Bank', 'Union Bank Of Nigeria', 'Sterling Bank', 'Moniepoint', 'UNITED BANK FOR AFRICA',
  'Access Bank (Diamond)', 'First City Monument Bank', 'Ecobank Nigeria', 'UNITY BANK PLC',
  'Stanbic IBTC Bank', 'Fidelity Bank', 'Polaris Bank', 'Providus Bank', 'STANDARD CHARTERED BANK',
  'VFD MFB', 'Paga', "ACCESS Y'ello & Beta", 'Fairmoney MFB', 'Sparkle', 'CARBON',
  'TITAN TRUST BANK', '9 PSB', 'MoMo PSB', 'SmartCash PSB', 'FETS', 'Taj Bank', 'Keystone Bank',
  'Jaiz Bank', 'Globus Bank', 'LOTUS BANK', 'NPF MICROFINANCE BANK',
];

// NOTE: Recent transfers and Zannypay contacts are still local/mock data here —
// same as the other backend gaps we've flagged before (savings/loans GET routes, etc).
// There's no GET /transfers/recent or GET /contacts endpoint on the NestJS side yet.
// Tapping an item still works and prefills the form below, so the moment those
// endpoints exist you just swap these arrays for fetched data.
const RECENT_TRANSFERS = [
  { id: '1', name: 'KUDIRAT oluwarinu ELEBUTE', acc: '9053683551', bank: 'OPay', date: 'Jul 13, 2026' },
  { id: '2', name: 'Fatimoh Adeola Ojuwuwayo', acc: '8069417550', bank: 'OPay', date: 'Jul 13, 2026' },
  { id: '3', name: 'YEMISI TAIWO', acc: '7051321643', bank: 'OPay', date: 'Jul 13, 2026' },
  { id: '4', name: 'Olarotimi Adukeola Morgan', acc: '8039288190', bank: 'OPay', date: 'Jul 12, 2026' },
  { id: '5', name: 'ELEBUTE ADEBAYO MUFUTAU', acc: '0002999914', bank: 'Union Bank Of Nigeria', date: 'Jul 09, 2026' },
  { id: '6', name: 'HAFKUB VENTURE', acc: '5482950251', bank: 'Moniepoint', date: 'Jul 09, 2026' },
];

const ZANNY_CONTACTS = [
  { id: '1', name: 'ADEGBESAN JOSEPH ADEWUNMI', phone: '8127689948', date: 'May 23, 2026', role: null },
  { id: '2', name: 'RAMOTA ADENIKE ISMAILA', phone: '8075102551', date: 'Oct 25, 2025', role: null },
  { id: '3', name: 'olajumoke muniratu', phone: '8900239724', date: '', role: 'Agent' },
  { id: '4', name: 'DAVID LAWAN STOVER', phone: '8900459217', date: '', role: 'Merchant' },
  { id: '5', name: 'FATIMOH OLUWATOMIWA BALOGUN', phone: '8901973447', date: '', role: 'Merchant' },
  { id: '6', name: 'CHIEMEKA AWAM', phone: '8148824821', date: 'Mar 26, 2025', role: null },
  { id: '7', name: 'JOHN NWABUEZE UCHEGBULEM', phone: '8901867126', date: '', role: 'Merchant' },
];

export default function TransferScreen({ navigation, route }) {
  const theme = colors.dark;
  const { balance, transferMoney } = useWallet();

  // 'bank' = external transfer, 'zanny' = internal Zannypay-to-Zannypay transfer
  const [tab, setTab] = useState('bank');
  const [subTab, setSubTab] = useState('recent');

  const [account, setAccount] = useState('');
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');

  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const amountInputRef = useRef(null);

  // Animated tab underline
  const tabAnim = useRef(new Animated.Value(0)).current;
  // Animated fade for whichever list (recent/favorites/contacts) is showing
  const listFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(tabAnim, {
      toValue: tab === 'bank' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [tab]);

  useEffect(() => {
    listFade.setValue(0);
    Animated.timing(listFade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [subTab]);

  useEffect(() => {
    const params = route?.params;
    if (params?.prefillAccount) {
      setAccount(params.prefillAccount);
      if (params.prefillBank) {
        setBank(params.prefillBank);
        setTab('bank');
      } else {
        setTab('zanny');
      }
    }
  }, [route?.params]);

  const filteredBanks = BANK_LIST.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setSubTab(newTab === 'zanny' ? 'contacts' : 'recent');
  };

  const focusAmountField = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => amountInputRef.current?.focus(), 300);
  };

  const handlePickRecent = (item) => {
    setTab('bank');
    setAccount(item.acc);
    setBank(item.bank);
    focusAmountField();
  };

  const handlePickContact = (item) => {
    setTab('zanny');
    setAccount(item.phone);
    setBank('');
    focusAmountField();
  };

  const handleInitiateTransfer = () => {
    if (!account || !amount) {
      Alert.alert('Missing Info', 'Please enter an account number and amount.');
      return;
    }
    if (tab === 'bank' && !bank) {
      Alert.alert('Missing Info', 'Please select a destination bank.');
      return;
    }
    if (parseFloat(amount) > balance) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this transfer.');
      return;
    }
    setShowPinModal(true);
  };

  const handleConfirmTransfer = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit transaction PIN.');
      return;
    }

    setLoading(true);
    const res = await transferMoney({
      recipientAccount: account,
      bank: tab === 'zanny' ? 'Zannypay' : bank,
      amount,
      note,
      pin,
    });
    setLoading(false);
    setShowPinModal(false);
    setPin('');

    if (!res.ok) {
      Alert.alert('Transfer Failed', res.error);
      return;
    }

    Alert.alert('Transfer Successful', `Sent ${formatCurrency(amount)} to ${account}.`, [
      { text: 'View Receipt', onPress: () => navigation.navigate('TransactionDetail', { txn: res.txn }) },
      { text: 'Done', onPress: () => navigation.navigate('Main') },
    ]);
  };

  const renderRecentItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.contactItem} onPress={() => handlePickRecent(item)}>
      <View style={[styles.contactAvatar, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={[styles.contactAvatarText, { color: theme.text }]}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.contactDetails, { color: theme.textMuted }]}>{item.acc}  •  {item.bank}</Text>
        {item.date ? <Text style={[styles.contactDate, { color: theme.textMuted }]}>Last transfer on {item.date}</Text> : null}
      </View>
      <MaterialCommunityIcons name="bank-transfer" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );

  const renderZannyContact = (item) => (
    <TouchableOpacity key={item.id} style={styles.contactItem} onPress={() => handlePickContact(item)}>
      <View style={[styles.contactAvatar, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={[styles.contactAvatarText, { color: theme.text }]}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.contactName, { color: theme.text, flexShrink: 1 }]} numberOfLines={1}>{item.name}</Text>
          {item.role && (
            <View style={[styles.roleTag, { backgroundColor: item.role === 'Agent' ? '#1E90FF20' : `${theme.success}20` }]}>
              <Text style={[styles.roleText, { color: item.role === 'Agent' ? '#1E90FF' : theme.success }]}>{item.role}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.contactDetails, { color: theme.textMuted }]}>{item.phone}</Text>
        {item.date ? <Text style={[styles.contactDate, { color: theme.textMuted }]}>Last transfer on {item.date}</Text> : null}
      </View>
      <Ionicons name="flash-outline" size={18} color={theme.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {tab === 'bank' ? 'Transfer to Bank' : 'Transfer to Zannypay'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Ionicons name="receipt-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Animated Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => handleTabSwitch('bank')}>
          <Text style={[styles.tabText, { color: tab === 'bank' ? theme.primary : theme.textMuted }]}>To Bank</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => handleTabSwitch('zanny')}>
          <Text style={[styles.tabText, { color: tab === 'zanny' ? theme.primary : theme.textMuted }]}>To Zannypay</Text>
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: theme.primary,
              left: tabAnim.interpolate({ inputRange: [0, 1], outputRange: ['5%', '55%'] }),
            },
          ]}
        />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.balanceText, { color: theme.textMuted }]}>
          Available: <Text style={{ color: theme.success, fontWeight: '800' }}>{formatCurrency(balance)}</Text>
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Account Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder={tab === 'bank' ? '0000000000' : 'Account No. or Phone No.'}
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          value={account}
          onChangeText={setAccount}
          maxLength={10}
        />

        {tab === 'bank' ? (
          <>
            <Text style={[styles.label, { color: theme.text }]}>Select Bank</Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setBankModalVisible(true)}
            >
              <Text style={{ color: bank ? theme.text : theme.textMuted, fontWeight: '600' }}>
                {bank || 'Choose a bank'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.zannyStaticSelect, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.zannyStaticIcon, { backgroundColor: theme.primary }]}>
              <Text style={styles.zannyStaticIconText}>Z</Text>
            </View>
            <Text style={[styles.zannyStaticText, { color: theme.text }]}>Zannypay</Text>
          </View>
        )}

        <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
        <TextInput
          ref={amountInputRef}
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="₦0.00"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: theme.text }]}>Add a Note (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="What is this for?"
          placeholderTextColor={theme.textMuted}
          value={note}
          onChangeText={setNote}
        />

        <GradientButton title="Next" onPress={handleInitiateTransfer} style={{ marginTop: 30 }} />

        <View style={[styles.promoBanner]}>
          <Text style={[styles.promoText, { color: theme.textMuted }]}>
            <Text style={[styles.promoHighlight, { color: theme.primary }]}>
              {tab === 'bank' ? 'FREE' : 'INSTANT'}
            </Text>{' '}
            | {tab === 'bank' ? 'Unlimited transfers with 0 fees' : 'Seamless transfers without delay'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
        </View>

        <TouchableOpacity style={[styles.monitorBanner, { backgroundColor: theme.surface }]}>
          <Ionicons name="pulse-outline" size={20} color={theme.primary} />
          <Text style={[styles.monitorText, { color: theme.text }]}>Bank transfer success rate monitor</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Sub Tabs */}
        <View style={styles.subTabContainer}>
          <View style={styles.subTabLeft}>
            <TouchableOpacity onPress={() => setSubTab('recent')}>
              <Text style={[styles.subTabText, { color: subTab === 'recent' ? theme.primary : theme.textMuted }]}>Recent</Text>
              {subTab === 'recent' && <View style={[styles.subTabIndicator, { backgroundColor: theme.primary }]} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSubTab('favorites')}>
              <Text style={[styles.subTabText, { color: subTab === 'favorites' ? theme.primary : theme.textMuted }]}>Favorites</Text>
              {subTab === 'favorites' && <View style={[styles.subTabIndicator, { backgroundColor: theme.primary }]} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSubTab('contacts')}>
              <Text style={[styles.subTabText, { color: subTab === 'contacts' ? theme.primary : theme.textMuted }]}>Zannypay Contacts</Text>
              {subTab === 'contacts' && <View style={[styles.subTabIndicator, { backgroundColor: theme.primary }]} />}
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={{ opacity: listFade }}>
          <View style={styles.listContainer}>
            {subTab === 'recent' && RECENT_TRANSFERS.map(renderRecentItem)}
            {subTab === 'contacts' && ZANNY_CONTACTS.map(renderZannyContact)}
            {subTab === 'favorites' && (
              <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 30 }}>No favorites yet</Text>
            )}
            {(subTab === 'recent' || subTab === 'contacts') && (
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={[styles.viewAllText, { color: theme.textMuted }]}>View All </Text>
                <Ionicons name="chevron-forward" size={12} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Select Bank Modal */}
      <Modal
        visible={bankModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBankModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setBankModalVisible(false)}>
              <Ionicons name="close" size={26} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Bank</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
            <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search Bank"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalBankRow, { borderBottomColor: theme.surface }]}
                onPress={() => {
                  setBank(item);
                  setBankModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <View style={[styles.modalBankIcon, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.modalBankIconText, { color: theme.text }]}>{item.charAt(0)}</Text>
                </View>
                <Text style={[styles.modalBankText, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={[styles.noBankText, { color: theme.textMuted }]}>No banks found</Text>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* PIN Confirmation Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModalCard, { backgroundColor: theme.surfaceAlt }]}>
            <Text style={[styles.pinModalTitle, { color: theme.text }]}>Confirm Transfer</Text>
            <Text style={[styles.pinModalSubtitle, { color: theme.textMuted }]}>
              You are sending <Text style={{ fontWeight: '800', color: theme.success }}>{formatCurrency(amount)}</Text> to {account}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.primary,
                  color: theme.text,
                  textAlign: 'center',
                  fontSize: 24,
                  letterSpacing: 12,
                  marginTop: 10,
                },
              ]}
              placeholder="••••"
              placeholderTextColor={theme.border}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              autoFocus
            />

            <GradientButton title="Confirm & Send" onPress={handleConfirmTransfer} loading={loading} style={{ marginTop: 25 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPinModal(false); setPin(''); }}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  tabContainer: { flexDirection: 'row', marginHorizontal: 20, borderBottomWidth: 1, position: 'relative' },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '600' },
  tabIndicator: { position: 'absolute', bottom: 0, width: '40%', height: 2, borderRadius: 1 },

  scroll: { padding: 24 },
  balanceText: { textAlign: 'center', fontSize: 14, marginBottom: 20, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 20 },
  input: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, borderWidth: 1, fontWeight: '600' },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1 },

  zannyStaticSelect: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1 },
  zannyStaticIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  zannyStaticIconText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  zannyStaticText: { fontSize: 16, fontWeight: '500' },

  promoBanner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 15 },
  promoText: { fontSize: 12, marginRight: 5 },
  promoHighlight: { fontWeight: 'bold' },

  monitorBanner: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 25 },
  monitorText: { flex: 1, fontSize: 13, marginLeft: 10, fontWeight: '500' },

  subTabContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subTabLeft: { flexDirection: 'row', gap: 20 },
  subTabText: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  subTabIndicator: { height: 2, width: 20, borderRadius: 1 },

  listContainer: { paddingBottom: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contactAvatarText: { fontSize: 18, fontWeight: 'bold' },
  contactInfo: { flex: 1, justifyContent: 'center' },
  contactName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  contactDetails: { fontSize: 12, marginBottom: 2 },
  contactDate: { fontSize: 11 },
  roleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  roleText: { fontSize: 10, fontWeight: '700' },

  viewAllBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  viewAllText: { fontSize: 12 },

  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 20, borderRadius: 10, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontSize: 15 },
  modalBankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  modalBankIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  modalBankIconText: { fontSize: 14, fontWeight: 'bold' },
  modalBankText: { fontSize: 15, fontWeight: '500' },
  noBankText: { textAlign: 'center', marginTop: 40, fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pinModalCard: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  pinModalTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  pinModalSubtitle: { fontSize: 15, textAlign: 'center', marginTop: 10, marginBottom: 25 },
  cancelBtn: { marginTop: 20, padding: 15, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 16 },
});
