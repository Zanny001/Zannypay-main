import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import GradientButton from '../components/GradientButton';

const AMOUNTS = ['100', '200', '500', '1000', '2000', '5000'];

export default function AirtimeScreen({ navigation }) {
  const theme = colors.dark;
  const [activeTab, setActiveTab] = useState('Airtime');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  const handleTopup = () => {
    if (!phone || !amount) {
      Alert.alert('Details Required', 'Please enter a phone number and select an amount.');
      return;
    }
    Alert.alert('Confirm Purchase', `Buy ₦${amount} ${activeTab} for ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Now', onPress: () => {
          Alert.alert('Success', 'Top-up successful! Cashback earned.');
          navigation.goBack();
      }}
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mobile Top-up</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="time-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
          {['Airtime', 'Data Bundle'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && { backgroundColor: theme.surfaceAlt }]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? theme.primary : theme.textMuted }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Card */}
        <View style={[styles.inputCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="0800 000 0000"
              placeholderTextColor={theme.border}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity>
              <Ionicons name="person-circle" size={32} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cashback Banner */}
        <View style={[styles.promoBanner, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
          <MaterialCommunityIcons name="ticket-percent" size={20} color={theme.accent} />
          <Text style={[styles.promoText, { color: theme.accent }]}>Get up to 6% Cashback on every Top-up!</Text>
        </View>

        {/* Amount Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Top-up Amount</Text>
        <View style={styles.grid}>
          {AMOUNTS.map((amt) => (
            <TouchableOpacity 
              key={amt} 
              style={[
                styles.gridItem, 
                { backgroundColor: theme.surface, borderColor: amount === amt ? theme.primary : theme.border },
                amount === amt && { backgroundColor: 'rgba(98, 54, 255, 0.1)' }
              ]}
              onPress={() => setAmount(amt)}
            >
              <Text style={[styles.gridAmt, { color: amount === amt ? theme.primary : theme.text }]}>₦{amt}</Text>
              <Text style={[styles.gridCashback, { color: theme.success }]}>Cashback ₦{parseInt(amt) * 0.02}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <GradientButton title="Pay Now" onPress={handleTopup} style={{ marginTop: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scroll: { padding: 20 },
  tabContainer: { flexDirection: 'row', borderRadius: 16, padding: 6, marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 15, fontWeight: '700' },
  inputCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 24, fontWeight: '800', padding: 0 },
  promoBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 30 },
  promoText: { fontSize: 13, fontWeight: '700', marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '31%', borderWidth: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  gridAmt: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  gridCashback: { fontSize: 10, fontWeight: '700' },
});
