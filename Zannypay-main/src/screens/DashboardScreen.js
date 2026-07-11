import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrency, maskAccount } from '../utils/format';
import { useWallet } from '../context/WalletContext';
import { getUnreadCount } from '../utils/notifications';
import TransactionRow from '../components/TransactionRow';
import FundModal from '../components/FundModal';

// <-- ADDED AIRTIME HERE -->
const QUICK_ACTIONS = [
  { key: 'Transfer', icon: 'swap-horizontal', label: 'Transfer' },
  { key: 'Airtime', icon: 'phone-portrait-outline', label: 'Airtime' },
  { key: 'Bills', icon: 'receipt-outline', label: 'Bills' },
  { key: 'Fund', icon: 'add-circle-outline', label: 'Fund Wallet' },
  { key: 'Savings', icon: 'trending-up-outline', label: 'Save & Grow' },
  { key: 'Loans', icon: 'cash-outline', label: 'Flexi Credit' },
  { key: 'Beneficiaries', icon: 'people-outline', label: 'Recipients' },
  { key: 'QRPay', icon: 'qr-code-outline', label: 'My Code' },
];

export default function DashboardScreen({ navigation }) {
  const theme = colors.dark;
  const { user, balance, transactions, syncWallet, isBalanceHidden, toggleBalanceHidden } = useWallet();
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getUnreadCount(transactions).then(setUnreadCount);
    }, [transactions])
  );

  const handleQuickAction = (key) => {
    if (key === 'Fund') return setFundModalVisible(true);
    if (key === 'Bills') return navigation.navigate('Bills');
    navigation.navigate(key); // This will route to 'Airtime' automatically now
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncWallet();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        <View style={styles.header}>
          <View style={styles.userInfoRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.name || 'N')[0].toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.hello, { color: theme.text }]}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
              <Text style={[styles.account, { color: theme.textMuted }]}>{maskAccount(user?.accountNumber || user?.phone || '0000')}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <View style={[styles.focusToggleWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.focusLabel, { color: theme.textMuted }]}>Focus</Text>
              <Switch
                value={isFocusMode}
                onValueChange={setIsFocusMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
              />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={[styles.bellBtn, { backgroundColor: theme.surface }]}>
              <Ionicons name="notifications-outline" size={22} color={theme.text} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient colors={['#2A1F45', '#1A1525']} style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity onPress={toggleBalanceHidden} style={styles.eyeIconWrap}>
              <Ionicons name={isBalanceHidden ? 'eye-off' : 'eye'} size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.balanceValue, { color: theme.text }]}>
            {isBalanceHidden ? '••••••' : formatCurrency(balance)}
          </Text>
          <View style={styles.cardBottomRow}>
            <TouchableOpacity style={styles.fundBtn} onPress={() => setFundModalVisible(true)}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.fundBtnText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.transferBtn} onPress={() => navigation.navigate('Transfer')}>
              <Text style={styles.transferBtnText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {!isFocusMode && (
          <View style={styles.gridContainer}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity key={action.key} style={styles.gridItem} onPress={() => handleQuickAction(action.key)}>
                <View style={[styles.gridIconWrap, { backgroundColor: theme.surface }]}>
                  <Ionicons name={action.icon} size={24} color={theme.primary} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          {!isFocusMode && (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', paddingBottom: transactions?.length === 0 ? 0 : 10 }}>
          {transactions?.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.background }]}>
                <Ionicons name="wallet-outline" size={32} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Transactions Yet</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>Your financial journey starts here.</Text>
            </View>
          ) : (
            transactions?.slice(0, isFocusMode ? 10 : 5).map((txn) => (
              <TransactionRow key={txn.id} txn={txn} />
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <FundModal visible={fundModalVisible} onClose={() => setFundModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  hello: { fontSize: 16, fontWeight: '700' },
  account: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  focusToggleWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  focusLabel: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  balanceCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 25 },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#A09CAB', fontSize: 13, fontWeight: '600' },
  eyeIconWrap: { padding: 4 },
  balanceValue: { fontSize: 34, fontWeight: '800', marginTop: 8, marginBottom: 20 },
  cardBottomRow: { flexDirection: 'row', gap: 12 },
  fundBtn: { flex: 1, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  fundBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  transferBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  transferBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginBottom: 20 },
  gridItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  gridIconWrap: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gridLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  emptyStateContainer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
