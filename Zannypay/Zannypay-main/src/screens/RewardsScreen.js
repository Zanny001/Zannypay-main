import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function RewardsScreen() {
  const theme = colors.dark;
  const { user } = useWallet();

  // Keys are scoped per-user so points/check-ins never leak
  const ownerId = user?.id || user?.phone || 'guest';
  const pointsKey = `@zannypoints_balance:${ownerId}`;
  const checkinKey = `@zanny_last_checkin:${ownerId}`;

  const [points, setPoints] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRewardsData = async () => {
      setLoading(true);
      try {
        const savedPoints = await AsyncStorage.getItem(pointsKey);
        const lastCheckInDate = await AsyncStorage.getItem(checkinKey);
        setPoints(savedPoints !== null ? parseInt(savedPoints, 10) : 0);
        const todayString = new Date().toISOString().split('T')[0];
        setCheckedIn(lastCheckInDate === todayString);
      } catch (error) {
        console.error('Storage error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRewardsData();
  }, [pointsKey, checkinKey, ownerId]);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    try {
      const nextPoints = points + 50;
      const todayString = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(pointsKey, nextPoints.toString());
      await AsyncStorage.setItem(checkinKey, todayString);
      setPoints(nextPoints);
      setCheckedIn(true);
      Alert.alert('Daily Reward Claimed!', 'You earned +50 ZannyPoints.');
    } catch (e) {
      Alert.alert('Error', 'Could not save points.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Rewards</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* ZannyPoints Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.surfaceAlt }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="star" size={24} color={theme.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.heroTitle, { color: theme.textMuted }]}>ZannyPoints Balance</Text>
          </View>
          <Text style={[styles.pointsValue, { color: theme.accent }]}>
            {points.toLocaleString()} <Text style={[styles.pts, { color: theme.text }]}>PTS</Text>
          </Text>
          <TouchableOpacity
            style={[styles.claimBtn, { backgroundColor: checkedIn ? theme.border : theme.primary }]}
            onPress={handleCheckIn}
            disabled={checkedIn}
          >
            <Text style={[styles.claimBtnText, { color: checkedIn ? theme.textMuted : '#FFF' }]}>
              {checkedIn ? 'Claimed Today' : 'Claim Daily +50'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, flex: 1.5, marginRight: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="currency-usd-circle" size={18} color={theme.accent} />
              <Text style={[styles.summaryTitle, { color: theme.textMuted }]}>Cashback</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: theme.text }]}>₦ 60.00</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, flex: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="ticket-percent" size={18} color={theme.success} />
              <Text style={[styles.summaryTitle, { color: theme.textMuted }]}>Coupons</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: theme.text }]}>2</Text>
          </View>
        </View>

        {/* Daily Tasks Section */}
        <View style={styles.tasksHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Tasks</Text>
          <View style={[styles.timerBadge, { backgroundColor: 'rgba(255, 77, 77, 0.1)' }]}>
            <Text style={[styles.timerText, { color: theme.danger }]}>02:30:43</Text>
          </View>
        </View>

        <View style={[styles.tasksContainer, { backgroundColor: theme.surface }]}>
          {/* Task 1 */}
          <View style={styles.taskItem}>
            <View style={[styles.taskIcon, { backgroundColor: theme.border }]}>
              <Ionicons name="swap-vertical" size={20} color={theme.info} />
            </View>
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, { color: theme.text }]}>Data Bundle Purchase</Text>
              <Text style={[styles.taskReward, { color: theme.success }]}>Win ₦15 Data Bundle Coupon (0/1)</Text>
            </View>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.border }]}>
              <Ionicons name="lock-closed" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Task 2 */}
          <View style={[styles.taskItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.taskIcon, { backgroundColor: theme.border }]}>
              <MaterialCommunityIcons name="storefront" size={20} color={theme.accent} />
            </View>
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, { color: theme.text }]}>Activate My Biz Hub</Text>
              <Text style={[styles.taskReward, { color: theme.success }]}>₦100+ via Biz Account for iPhone draw</Text>
            </View>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
              <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  scrollContainer: { paddingHorizontal: 20 },
  heroCard: { borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 16, fontWeight: '600' },
  pointsValue: { fontSize: 40, fontWeight: '800', marginBottom: 20 },
  pts: { fontSize: 18, fontWeight: '600' },
  claimBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, width: '100%', alignItems: 'center' },
  claimBtnText: { fontWeight: '800', fontSize: 16 },
  summaryRow: { flexDirection: 'row', marginBottom: 25 },
  summaryCard: { borderRadius: 20, padding: 20, justifyContent: 'center' },
  summaryTitle: { fontSize: 14, marginLeft: 6, fontWeight: '600' },
  summaryAmount: { fontSize: 24, fontWeight: '800' },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  timerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  tasksContainer: { borderRadius: 20, paddingVertical: 10, marginBottom: 40 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2A1F45' },
  taskIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  taskContent: { flex: 1, paddingRight: 10 },
  taskTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  taskReward: { fontSize: 12, fontWeight: '600' },
  actionBtn: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontWeight: '800', fontSize: 13 },
});
