import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. Network Providers Data
const NETWORKS = [
  { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#000' },
  { id: 'airtel', name: 'Airtel', color: '#FF0000', textColor: '#FFF' },
  { id: 'glo', name: 'GLO', color: '#009900', textColor: '#FFF' },
  { id: '9mobile', name: '9mobile', color: '#006600', textColor: '#FFF' }
];

// 2. Extended Tabs from Images
const TABS = ['Best Offers', 'Daily', 'Weekly', 'Monthly', '2-Month', '3-Month', 'Data Share'];

// 3. Dynamic Data Dictionary per Tab
const PLAN_DATA = {
  'Best Offers': [
    { id: '1', data: '1GB', duration: '1 DAY', price: '₦500', payPrice: '₦440', label: 'Buy Again' },
    { id: '2', data: '110MB', duration: '1 DAY', price: '₦100', payPrice: '₦50' },
    { id: '3', data: '20MB', duration: '1 DAY', price: '₦25', payPrice: '₦13' },
    { id: '4', data: '500MB', duration: '7 DAYS', price: '₦500', payPrice: '₦440' },
    { id: '5', data: '1GB', duration: '7 DAYS', price: '₦800', payPrice: '₦740' },
    { id: '6', data: '2GB', duration: '30 DAYS', price: '₦1,500', payPrice: '₦1440' },
  ],
  'Daily': [
    { id: 'd1', data: '50MB', duration: '1 DAY', price: '₦50', payPrice: '₦48' },
    { id: 'd2', data: '110MB', duration: '1 DAY', price: '₦100', payPrice: '₦98' },
    { id: 'd3', data: '200MB', duration: '2 DAYS', price: '₦200', payPrice: '₦195' },
    { id: 'd4', data: '1GB', duration: '1 DAY', price: '₦350', payPrice: '₦340' },
    { id: 'd5', data: '2GB', duration: '2 DAYS', price: '₦500', payPrice: '₦490' },
    { id: 'd6', data: '2.5GB', duration: '2 DAYS', price: '₦600', payPrice: '₦585' },
  ],
  'Weekly': [
    { id: 'w1', data: '350MB', duration: '7 DAYS', price: '₦300', payPrice: '₦295' },
    { id: 'w2', data: '500MB', duration: '7 DAYS', price: '₦500', payPrice: '₦490' },
    { id: 'w3', data: '1.5GB', duration: '7 DAYS', price: '₦1,000', payPrice: '₦980' },
    { id: 'w4', data: '6GB', duration: '7 DAYS', price: '₦1,500', payPrice: '₦1,470' },
  ],
  'Monthly': [
    { id: 'm1', data: '1.2GB', duration: '30 DAYS', price: '₦1,000', payPrice: '₦980' },
    { id: 'm2', data: '1.5GB', duration: '30 DAYS', price: '₦1,200', payPrice: '₦1,180' },
    { id: 'm3', data: '3GB', duration: '30 DAYS', price: '₦1,500', payPrice: '₦1,470' },
    { id: 'm4', data: '4GB', duration: '30 DAYS', price: '₦2,000', payPrice: '₦1,960' },
    { id: 'm5', data: '10GB', duration: '30 DAYS', price: '₦3,000', payPrice: '₦2,940' },
    { id: 'm6', data: '15GB', duration: '30 DAYS', price: '₦4,000', payPrice: '₦3,920' },
  ],
  '2-Month': [
    { id: '2m1', data: '30GB', duration: '60 DAYS', price: '₦8,000', payPrice: '₦7,840' },
    { id: '2m2', data: '50GB', duration: '60 DAYS', price: '₦10,000', payPrice: '₦9,800' },
    { id: '2m3', data: '75GB', duration: '60 DAYS', price: '₦15,000', payPrice: '₦14,700' },
  ],
  '3-Month': [
    { id: '3m1', data: '120GB', duration: '90 DAYS', price: '₦20,000', payPrice: '₦19,600' },
    { id: '3m2', data: '150GB', duration: '90 DAYS', price: '₦25,000', payPrice: '₦24,500' },
    { id: '3m3', data: '250GB', duration: '90 DAYS', price: '₦30,000', payPrice: '₦29,400' },
    { id: '3m4', data: '400GB', duration: '90 DAYS', price: '₦50,000', payPrice: '₦49,000' },
  ],
  'Data Share': [
    { id: 'ds1', data: '10GB', duration: '30 DAYS', price: '₦3,000', payPrice: '₦2,950' },
    { id: 'ds2', data: '25GB', duration: '30 DAYS', price: '₦6,000', payPrice: '₦5,900' },
  ]
};

export default function DataScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('Best Offers');
  
  // Network Selection State
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [networkModalVisible, setNetworkModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Data</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
          <Ionicons name="receipt-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TouchableOpacity 
          style={[styles.networkBadge, { backgroundColor: selectedNetwork.color }]} 
          onPress={() => setNetworkModalVisible(true)}
        >
          <Text style={[styles.networkText, { color: selectedNetwork.textColor }]}>{selectedNetwork.name}</Text>
          <Ionicons name="chevron-down" size={12} color={selectedNetwork.textColor} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        
        <TextInput 
          style={styles.phoneInput} 
          value="0803 761 1259" 
          keyboardType="numeric"
        />
        <Ionicons name="person-circle" size={28} color="#6C5CE7" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.cashbackText}>Enjoy up to 2% Cashback on {selectedNetwork.name} recharges daily.</Text>

        {/* Dynamic Horizontal Tabs */}
        <View style={styles.tabsContainerWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {TABS.map((tab) => (
              <TouchableOpacity key={tab} onPress={() => { setActiveTab(tab); setSelectedPlan(null); }}>
                <Text style={[styles.tab, activeTab === tab && styles.activeTab]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Grid based on Tab */}
        <View style={styles.grid}>
          {PLAN_DATA[activeTab]?.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <Text style={styles.planDuration}>{plan.duration}</Text>
              <Text style={styles.planData}>{plan.data}</Text>
              <Text style={styles.planPriceStrike}>{plan.price}</Text>
              <Text style={styles.planPayPrice}>Pay {plan.payPrice}</Text>
              
              {plan.label && (
                <View style={styles.labelBadge}>
                  <Text style={styles.labelText}>{plan.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.payButton, !selectedPlan && { backgroundColor: '#333' }]} disabled={!selectedPlan}>
          <Text style={[styles.payButtonText, !selectedPlan && { color: '#888' }]}>Proceed to Pay</Text>
        </TouchableOpacity>
      </View>

      {/* Network Selector Modal */}
      <Modal visible={networkModalVisible} animationType="fade" transparent={true} onRequestClose={() => setNetworkModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setNetworkModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Provider</Text>
            {NETWORKS.map((network) => (
              <TouchableOpacity 
                key={network.id} 
                style={styles.modalRow}
                onPress={() => {
                  setSelectedNetwork(network);
                  setNetworkModalVisible(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.modalNetworkDot, { backgroundColor: network.color }]} />
                  <Text style={styles.modalRowText}>{network.name}</Text>
                </View>
                {selectedNetwork.id === network.id && <Ionicons name="checkmark-circle" size={24} color="#6C5CE7" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  inputSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, height: 60, marginBottom: 15 },
  networkBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 12 },
  networkText: { fontWeight: 'bold', fontSize: 13 },
  phoneInput: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  cashbackText: { color: '#888', fontSize: 13, marginBottom: 20 },
  
  tabsContainerWrapper: { borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 20, paddingBottom: 0 },
  tabsContainer: { flexDirection: 'row', alignItems: 'center' },
  tab: { color: '#888', marginRight: 25, paddingBottom: 12, fontSize: 15 },
  activeTab: { color: '#FFF', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#6C5CE7' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  planCard: { width: '31%', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 15, position: 'relative', borderWidth: 1, borderColor: '#1A1A1A' },
  planCardActive: { borderColor: '#6C5CE7', backgroundColor: 'rgba(108, 92, 231, 0.1)' },
  planDuration: { color: '#888', fontSize: 10, marginBottom: 5 },
  planData: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  planPriceStrike: { color: '#888', fontSize: 12, textDecorationLine: 'line-through' },
  planPayPrice: { color: '#6C5CE7', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  labelBadge: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#6C5CE7', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingVertical: 4, alignItems: 'center' },
  labelText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  payButton: { backgroundColor: '#6C5CE7', padding: 16, borderRadius: 12, alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  modalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  modalNetworkDot: { width: 16, height: 16, borderRadius: 8, marginRight: 15 },
  modalRowText: { color: '#fff', fontSize: 16, fontWeight: '500' }
});
