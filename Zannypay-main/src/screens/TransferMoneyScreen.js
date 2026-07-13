import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const recentList = [
  { id: '1', name: 'KUDIRAT ELEBUTE', acc: '9053683551', bank: 'Opay', date: 'Jul 13, 2026' },
  { id: '2', name: 'YEMISI TAIWO', acc: '7051321643', bank: 'Opay', date: 'Jul 13, 2026' },
  { id: '3', name: 'Olarotimi Morgan', acc: '8039288190', bank: 'GTBank', date: 'Jul 12, 2026' },
];

export default function TransferMoneyScreen({ navigation }) {
  const [tab, setTab] = useState('bank');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer</Text>
        <Ionicons name="time-outline" size={24} color="#fff" />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'bank' && styles.activeTabBtn]} onPress={() => setTab('bank')}>
          <Text style={[styles.tabText, tab === 'bank' && styles.activeTabText]}>To Bank</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'zanny' && styles.activeTabBtn]} onPress={() => setTab('zanny')}>
          <Text style={[styles.tabText, tab === 'zanny' && styles.activeTabText]}>To Zannypay</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Enter 10-digit Account No." 
            placeholderTextColor="#666" 
            keyboardType="numeric" 
          />
        </View>

        <TouchableOpacity style={styles.bankSelect}>
          <Text style={styles.bankSelectText}>Select Bank</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Beneficiaries</Text>
        {recentList.map(item => (
          <TouchableOpacity key={item.id} style={styles.recentItem}>
            <View style={styles.recentAvatar}>
              <Text style={styles.recentAvatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.recentDetails}>{item.acc} • {item.bank}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTabBtn: { borderBottomWidth: 2, borderBottomColor: '#6C5CE7' },
  tabText: { color: '#666', fontSize: 15, fontWeight: '600' },
  activeTabText: { color: '#6C5CE7' },
  scrollContent: { paddingHorizontal: 20 },
  inputContainer: { backgroundColor: '#1A1A1A', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15 },
  input: { height: 60, color: '#fff', fontSize: 16 },
  bankSelect: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 15, height: 60, marginBottom: 25 },
  bankSelectText: { color: '#fff', fontSize: 16 },
  nextBtn: { backgroundColor: '#333', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  nextBtnText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  recentItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  recentAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#2A2A35', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  recentAvatarText: { color: '#6C5CE7', fontSize: 18, fontWeight: 'bold' },
  recentInfo: { flex: 1 },
  recentName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  recentDetails: { color: '#888', fontSize: 13 }
});
