import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import TransactionRow from '../components/TransactionRow';

export default function HistoryScreen({ navigation }) {
  const theme = colors.dark;
  const { transactions, syncWallet } = useWallet();
  const [filter, setFilter] = useState('all'); // 'all' | 'credit' | 'debit'
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = transactions?.filter(txn => {
    if (filter === 'all') return true;
    return txn.type === filter;
  }) || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await syncWallet();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Transaction History</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="search" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'credit', 'debit'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterPill, 
              { backgroundColor: filter === f ? theme.primary : theme.surface },
              filter === f && styles.filterPillActive
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#FFF' : theme.textMuted }]}>
              {f === 'all' ? 'All' : f === 'credit' ? 'Money In' : 'Money Out'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <TransactionRow txn={item} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="receipt-outline" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Records Found</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>You do not have any {filter !== 'all' ? filter : ''} transactions yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  title: { fontSize: 20, fontWeight: '800' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  filterPill: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: 'transparent' },
  filterPillActive: { shadowColor: '#6236FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  filterText: { fontSize: 14, fontWeight: '700' },
  listContent: { paddingBottom: 40, flexGrow: 1 },
  emptyStateContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
