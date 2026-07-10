import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import Card from '../components/Card';

export default function RewardsScreen() {
  const { user } = useWallet();
  // Keys are scoped per-user so points/check-ins never leak between accounts
  // that share the same device.
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
  }, [pointsKey, checkinKey]);

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

  if (loading) return <SafeAreaView style={[styles.container, {justifyContent: 'center'}]}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards Center</Text>
        </View>
        <View style={styles.heroCard}>
          <Ionicons name="star" size={32} color="#F5B700" />
          <Text style={styles.pointsValue}>{points.toLocaleString()} <Text style={styles.pts}>PTS</Text></Text>
          <TouchableOpacity style={[styles.claimBtn, checkedIn && styles.claimedBtn]} onPress={handleCheckIn} disabled={checkedIn}>
            <Text style={styles.claimBtnText}>{checkedIn ? 'Claimed Today' : 'Claim Daily +50'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  heroCard: { backgroundColor: colors.textDark, borderRadius: 20, padding: 30, alignItems: 'center' },
  pointsValue: { color: '#F5B700', fontSize: 40, fontWeight: '800', marginVertical: 8 },
  pts: { fontSize: 18, color: '#fff' },
  claimBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 },
  claimedBtn: { backgroundColor: '#333' },
  claimBtnText: { color: '#fff', fontWeight: '700' }
});
