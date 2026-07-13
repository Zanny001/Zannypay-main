import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock Data based on PalmPay screenshots
const BANK_LIST = [
  'GTBank', 'Access Bank', 'OPay', 'Kuda MFB', 'Zenith Bank', 'First Bank Of Nigeria',
  'Wema Bank', 'Union Bank Of Nigeria', 'Sterling Bank', 'Moniepoint', 'UNITED BANK FOR AFRICA',
  'Access Bank (Diamond)', 'First City Monument Bank', 'Ecobank Nigeria', 'UNITY BANK PLC',
  'Stanbic IBTC Bank', 'Fidelity Bank', 'Polaris Bank', 'Providus Bank', 'STANDARD CHARTERED BANK',
  'VFD MFB', 'Paga', "ACCESS Y'ello & Beta", 'Fairmoney MFB', 'Sparkle', 'CARBON', 
  'TITAN TRUST BANK', '9 PSB', 'MoMo PSB', 'SmartCash PSB', 'FETS', 'Taj Bank', 'Keystone Bank', 
  'Jaiz Bank', 'Globus Bank', 'LOTUS BANK', 'NPF MICROFINANCE BANK'
];

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

export default function TransferMoneyScreen({ navigation }) {
  const [tab, setTab] = useState('bank'); // 'bank' | 'zanny'
  const [subTab, setSubTab] = useState('recent'); // 'recent' | 'favorites' | 'contacts'
  
  // Bank Modal State
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);

  const filteredBanks = BANK_LIST.filter(bank => 
    bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    if (newTab === 'zanny') {
      setSubTab('contacts');
    } else {
      setSubTab('recent');
    }
  };

  const renderRecentItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.contactItem}>
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.contactDetails}>{item.acc}  {item.bank}</Text>
        {item.date ? <Text style={styles.contactDate}>Last transfer on  {item.date}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  const renderZannyContact = (item) => (
    <TouchableOpacity key={item.id} style={styles.contactItem}>
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.contactName, { flexShrink: 1 }]} numberOfLines={1}>{item.name}</Text>
          {item.role && (
            <View style={[styles.roleTag, { backgroundColor: item.role === 'Agent' ? '#1E90FF20' : '#2ED57320' }]}>
              <Text style={[styles.roleText, { color: item.role === 'Agent' ? '#1E90FF' : '#2ED573' }]}>{item.role}</Text>
            </View>
          )}
        </View>
        <Text style={styles.contactDetails}>{item.phone}</Text>
        {item.date ? <Text style={styles.contactDate}>Last transfer on  {item.date}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tab === 'bank' ? 'Transfer to Bank' : 'Transfer to Zannypay'}</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <Ionicons name="receipt-outline" size={22} color="#fff" />
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </View>
      </View>

      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'bank' && styles.activeTabBtn]} onPress={() => handleTabSwitch('bank')}>
          <Text style={[styles.tabText, tab === 'bank' && styles.activeTabText]}>To Bank</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'zanny' && styles.activeTabBtn]} onPress={() => handleTabSwitch('zanny')}>
          <Text style={[styles.tabText, tab === 'zanny' && styles.activeTabText]}>To Zannypay</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Input Form */}
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder={tab === 'bank' ? "Enter 10-digit Account No." : "Enter 10-digit Account No. or Phone No."}
            placeholderTextColor="#555" 
            keyboardType="numeric" 
          />
        </View>

        {tab === 'bank' ? (
          <TouchableOpacity style={styles.bankSelect} onPress={() => setBankModalVisible(true)}>
            <Text style={[styles.bankSelectText, !selectedBank && { color: '#555' }]}>
              {selectedBank ? selectedBank : 'Select bank'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <View style={styles.zannyStaticSelect}>
            <View style={styles.zannyStaticIcon}>
              <Text style={styles.zannyStaticIconText}>Z</Text>
            </View>
            <Text style={styles.zannyStaticText}>Zannypay</Text>
          </View>
        )}

        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.promoBanner}>
          <Text style={styles.promoText}><Text style={styles.promoHighlight}>{tab === 'bank' ? 'FREE' : 'INSTANT'}</Text> | {tab === 'bank' ? 'Unlimited transfers with 0 fees' : 'Seamless transfers without delay'} </Text>
          <Ionicons name="chevron-forward" size={14} color="#888" />
        </View>

        <TouchableOpacity style={styles.monitorBanner}>
          <Ionicons name="pulse-outline" size={20} color="#fff" />
          <Text style={styles.monitorText}>Bank transfer success rate monitor</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>

        {/* Sub Tabs */}
        <View style={styles.subTabContainer}>
          <View style={styles.subTabLeft}>
            <TouchableOpacity onPress={() => setSubTab('recent')}>
              <Text style={[styles.subTabText, subTab === 'recent' && styles.subTabTextActive]}>Recent</Text>
              {subTab === 'recent' && <View style={styles.subTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSubTab('favorites')}>
              <Text style={[styles.subTabText, subTab === 'favorites' && styles.subTabTextActive]}>Favorites</Text>
              {subTab === 'favorites' && <View style={styles.subTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSubTab('contacts')}>
              <Text style={[styles.subTabText, subTab === 'contacts' && styles.subTabTextActive]}>Zannypay Contacts</Text>
              {subTab === 'contacts' && <View style={styles.subTabIndicator} />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* List Rendering */}
        <View style={styles.listContainer}>
          {subTab === 'recent' && RECENT_TRANSFERS.map(renderRecentItem)}
          {subTab === 'contacts' && ZANNY_CONTACTS.map(renderZannyContact)}
          {subTab === 'favorites' && <Text style={{ color: '#555', textAlign: 'center', marginTop: 30 }}>No favorites yet</Text>}
          
          {(subTab === 'recent' || subTab === 'contacts') && (
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All </Text>
              <Ionicons name="chevron-forward" size={12} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Select Bank Modal */}
      <Modal visible={bankModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBankModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setBankModalVisible(false)}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Bank"
              placeholderTextColor="#666"
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
                style={styles.modalBankRow} 
                onPress={() => {
                  setSelectedBank(item);
                  setBankModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <View style={styles.modalBankIcon}>
                  <Text style={styles.modalBankIconText}>{item.charAt(0)}</Text>
                </View>
                <Text style={styles.modalBankText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.noBankText}>No banks found</Text>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#110F14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginTop: 10 },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#222' },
  activeTabBtn: { borderBottomColor: '#7F5DF0' },
  tabText: { color: '#888', fontSize: 15, fontWeight: '600' },
  activeTabText: { color: '#7F5DF0' },
  
  scrollContent: { paddingTop: 20 },
  inputContainer: { marginHorizontal: 20, marginBottom: 15 },
  input: { height: 50, color: '#fff', fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  
  bankSelect: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, height: 50, borderBottomWidth: 1, borderBottomColor: '#222', marginBottom: 25 },
  bankSelectText: { color: '#fff', fontSize: 16 },
  
  zannyStaticSelect: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, height: 50, borderBottomWidth: 1, borderBottomColor: '#222', marginBottom: 25 },
  zannyStaticIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7F5DF0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  zannyStaticIconText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  zannyStaticText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  nextBtn: { backgroundColor: '#2C273B', marginHorizontal: 20, paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
  nextBtnText: { color: '#555', fontSize: 16, fontWeight: 'bold' },
  
  promoBanner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  promoText: { color: '#888', fontSize: 12, marginRight: 5 },
  promoHighlight: { color: '#7F5DF0', fontWeight: 'bold' },
  
  monitorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1820', marginHorizontal: 20, padding: 15, borderRadius: 12, marginBottom: 25 },
  monitorText: { flex: 1, color: '#CCC', fontSize: 13, marginLeft: 10 },
  
  subTabContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  subTabLeft: { flexDirection: 'row', gap: 20 },
  subTabText: { color: '#888', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  subTabTextActive: { color: '#7F5DF0' },
  subTabIndicator: { height: 2, backgroundColor: '#7F5DF0', width: 20, borderRadius: 1 },
  
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contactAvatarText: { color: '#333', fontSize: 18, fontWeight: 'bold' },
  contactInfo: { flex: 1, justifyContent: 'center' },
  contactName: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  contactDetails: { color: '#AAA', fontSize: 12, marginBottom: 2 },
  contactDate: { color: '#666', fontSize: 11 },
  roleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  roleText: { fontSize: 10, fontWeight: '700' },
  
  viewAllBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  viewAllText: { color: '#888', fontSize: 12 },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#110F14' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1820', margin: 20, borderRadius: 10, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, color: '#fff', fontSize: 15 },
  modalBankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1A1820' },
  modalBankIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2C273B', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  modalBankIconText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  modalBankText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  noBankText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 15 }
});
