import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, SectionList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const historyData = [
  {
    title: 'July 2026',
    data: [
      { id: '1', type: 'send', title: 'Send - KUDIRAT ELEBUTE', date: 'Jul 13, 2026 3:56 PM', amount: '-₦2,000.00', isCredit: false },
      { id: '2', type: 'interest', title: 'Daily Savings Interest', date: 'Jul 13, 2026 7:05 AM', amount: '+₦1.43', isCredit: true },
      { id: '3', type: 'receive', title: 'Receive - Olarotimi', date: 'Jul 12, 2026 8:51 PM', amount: '+₦5,000.00', isCredit: true },
      { id: '4', type: 'airtime', title: 'Top up Airtime', date: 'Jul 12, 2026 8:55 AM', amount: '-₦1,000.00', isCredit: false },
    ]
  }
];

export default function TransactionHistoryScreen({ navigation }) {
  const getIcon = (type) => {
    switch(type) {
      case 'send': return <Ionicons name="arrow-up" size={18} color="#FF4757" />;
      case 'receive': return <Ionicons name="arrow-down" size={18} color="#2ED573" />;
      case 'interest': return <MaterialCommunityIcons name="piggy-bank" size={18} color="#FFA502" />;
      case 'airtime': return <Ionicons name="call" size={18} color="#1E90FF" />;
      default: return <Ionicons name="swap-horizontal" size={18} color="#fff" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemRow}>
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.isCredit ? '#2ED573' : '#FFF' }]}>
        {item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity>
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.monthText}>July Overview</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>In <Text style={styles.summaryValue}>₦323,528.47</Text></Text>
          <Text style={styles.summaryLabel}>Out <Text style={styles.summaryValue}>₦137,600.00</Text></Text>
        </View>
      </View>

      <SectionList
        sections={historyData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  downloadText: { color: '#6C5CE7', fontSize: 14, fontWeight: 'bold' },
  summaryBox: { backgroundColor: '#1A1A1A', margin: 20, marginTop: 0, padding: 20, borderRadius: 16 },
  monthText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#888', fontSize: 13 },
  summaryValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#222' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemDetails: { flex: 1 },
  itemTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  itemDate: { color: '#666', fontSize: 12 },
  itemAmount: { fontSize: 16, fontWeight: 'bold' }
});
