import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { gradients, colors } from '../theme/colors';
import { formatCurrency, maskAccount } from '../utils/format';
import { useWallet } from '../context/WalletContext';
import { getUnreadCount } from '../utils/notifications';
import TransactionRow from '../components/TransactionRow';
import Card from '../components/Card';
import FundModal from '../components/FundModal';

const QUICK_ACTIONS = [
  { key: 'Transfer', icon: 'swap-horizontal', label: 'Transfer' },
  { key: 'Bills', icon: 'receipt-outline', label: 'Bills' },
  { key: 'Invoice', icon: 'document-text-outline', label: 'Invoice' },
  { key: 'Fund', icon: 'add-circle-outline', label: 'Fund Wallet' },
  // Elite Modules (v2)
  { key: 'Savings', icon: 'trending-up-outline', label: 'Save & Grow' },
  { key: 'Loans', icon: 'cash-outline', label: 'Flexi Credit' },
  { key: 'Beneficiaries', icon: 'people-outline', label: 'Recipients' },
  { key: 'QRPay', icon: 'qr-code-outline', label: 'My Code' },
];

export default function DashboardScreen({ navigation }) {
  const { user, balance, transactions, syncWallet } = useWallet();
  const [hidden, setHidden] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  
  // UPGRADE: Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Elite Modules (v2) — unread notification badge
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getUnreadCount(transactions).then(setUnreadCount);
    }, [transactions])
  );

  const handleQuickAction = (key) => {
    if (key === 'Fund') return setFundModalVisible(true);
    if (key === 'Bills') return navigation.navigate('Bills');
    navigation.navigate(key);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncWallet();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ScrollView now supports Pull-To-Refresh */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.account}>{maskAccount(user?.accountNumber || user?.phone || '0000')}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <View style={styles.focusToggleWrap}>
              <Text style={styles.focusLabel}>Focus</Text>
              <Switch
                value={isFocusMode}
                onValueChange={setIsFocusMode}
                trackColor={{ false: '#ddd', true: colors.primary }}
                thumbColor={'#fff'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textDark} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.name || 'N')[0].toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient colors={gradients.primary} style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity onPress={() => setHidden(!hidden)}>
              <Ionicons name={hidden ? 'eye-off' : 'eye'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>
            {hidden ? '••••••' : formatCurrency(balance)}
          </Text>
          <View style={styles.cardChipRow}>
            <MaterialCommunityIcons name="wifi" size={20} color="#F5B700" style={{ transform: [{ rotate: '90deg' }] }} />
            <Text style={styles.cardTag}>Zannypay Virtual Wallet</Text>
          </View>
        </LinearGradient>

        {!isFocusMode && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActions}
          >
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity key={action.key} style={styles.actionItem} onPress={() => handleQuickAction(action.key)}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {!isFocusMode && (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        <Card style={{ marginHorizontal: 20, padding: transactions?.length === 0 ? 0 : 18 }}>
          {transactions?.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="wallet-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySub}>Your financial journey starts here. Fund your wallet to get started.</Text>
              {!isFocusMode && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setFundModalVisible(true)}>
                  <Text style={styles.emptyBtnText}>Fund Wallet</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            transactions?.slice(0, isFocusMode ? 10 : 5).map((txn) => <TransactionRow key={txn.id} txn={txn} />)
          )}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <FundModal
        visible={fundModalVisible}
        onClose={() => setFundModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  hello: { fontSize: 17, fontWeight: '700', color: colors.textDark },
  account: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  focusToggleWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 16, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  focusLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, marginRight: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: colors.border },
  bellBadge: { position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  balanceCard: { marginHorizontal: 20, borderRadius: 20, padding: 22, marginBottom: 20 },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#E6DEFF', fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 6 },
  cardChipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  cardTag: { color: '#E6DEFF', fontSize: 12, marginLeft: 8 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  actionItem: { alignItems: 'center', width: 76, marginRight: 8 },
  actionIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, color: colors.textDark, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  emptyStateContainer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
