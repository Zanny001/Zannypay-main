import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const dataPlans = [
  { id: '1', data: '1GB', duration: '1 DAY', price: '₦500', payPrice: '₦440', label: 'Buy Again' },
  { id: '2', data: '110MB', duration: '1 DAY', price: '₦100', payPrice: '₦50' },
  { id: '3', data: '20MB', duration: '1 DAY', price: '₦25', payPrice: '₦13' },
  { id: '4', data: '500MB', duration: '7 DAYS', price: '₦500', payPrice: '₦440' },
  { id: '5', data: '1GB', duration: '7 DAYS', price: '₦800', payPrice: '₦740' },
  { id: '6', data: '2GB', duration: '30 DAYS', price: '₦1,500', payPrice: '₦1440' },
];

export default function DataScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('1');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Data</Text>
        <Ionicons name="receipt-outline" size={24} color="#fff" />
      </View>

      <View style={styles.inputSection}>
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>MTN</Text>
        </View>
        <TextInput 
          style={styles.phoneInput}
          value="0803 761 1259"
          keyboardType="numeric"
        />
        <Ionicons name="person-circle" size={28} color="#6C5CE7" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.cashbackText}>Enjoy up to 2% Cashback on MTN recharges daily.</Text>

        <View style={styles.tabs}>
          <Text style={[styles.tab, styles.activeTab]}>Best Offers</Text>
          <Text style={styles.tab}>Daily</Text>
          <Text style={styles.tab}>Weekly</Text>
          <Text style={styles.tab}>Monthly</Text>
        </View>

        <View style={styles.grid}>
          {dataPlans.map((plan) => (
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

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Proceed to Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  inputSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, height: 60, marginBottom: 15 },
  networkBadge: { backgroundColor: '#FFCC00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 },
  networkText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  phoneInput: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  cashbackText: { color: '#888', fontSize: 13, marginBottom: 20 },
  tabs: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { color: '#888', marginRight: 25, paddingBottom: 10, fontSize: 15 },
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
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
