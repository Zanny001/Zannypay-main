import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function SavingsScreen({ navigation }) {
  const theme = colors.dark;
  const { isBalanceHidden, toggleBalanceHidden } = useWallet();
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Wealth</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Total Assets Header Card */}
        <TouchableOpacity
          style={[styles.assetsContainer, { backgroundColor: theme.surfaceAlt }]}
          onPress={() => setIsAssetsExpanded(!isAssetsExpanded)}
          activeOpacity={0.9}
        >
          <View style={styles.assetsHeader}>
            <View style={styles.assetsLeft}>
              <View style={styles.shieldRow}>
                <Ionicons name="shield-checkmark" size={14} color={theme.success} />
                <Text style={[styles.assetsLabel, { color: theme.textMuted }]}>Total Assets</Text>
                <TouchableOpacity onPress={toggleBalanceHidden} style={{ padding: 4 }}>
                  <Ionicons name={isBalanceHidden ? "eye-off-outline" : "eye-outline"} size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.totalAmount, { color: theme.text }]}>
                {isBalanceHidden ? '••••••' : '₦2,732,239.41'}
              </Text>
            </View>
            <View style={styles.assetsRight}>
              <Text style={[styles.assetsLabel, { color: theme.textMuted }]}>Yesterday's Earnings</Text>
              <Text style={[styles.earningsAmount, { color: theme.success }]}>
                {isBalanceHidden ? '••••' : '+₦1,126.55'} <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
              </Text>
            </View>
          </View>

          {isAssetsExpanded && (
            <View style={[styles.expandedAssets, { borderTopColor: theme.border }]}>
              <View style={styles.assetRow}>
                <Text style={[styles.assetName, { color: theme.textMuted }]}>App Balance</Text>
                <Text style={[styles.assetValue, { color: theme.text }]}>{isBalanceHidden ? '••••' : '₦50,000.00'} <Ionicons name="chevron-forward" size={14} color={theme.textMuted} /></Text>
              </View>
              <View style={styles.assetRow}>
                <Text style={[styles.assetName, { color: theme.textMuted }]}>CashBox</Text>
                <Text style={[styles.assetValue, { color: theme.success }]}>{isBalanceHidden ? '••••' : '+₦450.00'} <Ionicons name="chevron-forward" size={14} color={theme.textMuted} /></Text>
              </View>
              <View style={styles.assetRow}>
                <Text style={[styles.assetName, { color: theme.textMuted }]}>Target Savings</Text>
                <Text style={[styles.assetValue, { color: theme.text }]}>{isBalanceHidden ? '••••' : '₦1,200,000.00'} <Ionicons name="chevron-forward" size={14} color={theme.textMuted} /></Text>
              </View>
            </View>
          )}
          <Ionicons name={isAssetsExpanded ? "chevron-up" : "chevron-down"} size={20} color={theme.textMuted} style={styles.dropdownIcon} />
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.gridContainer}>
          {[
            { name: 'CashBox', icon: 'wallet' },
            { name: 'SmartEarn', icon: 'trending-up' },
            { name: 'SafeBox', icon: 'lock-closed' },
            { name: 'Target Savings', icon: 'bullseye' },
            { name: 'Loan', icon: 'cash' },
            { name: 'Fixed Savings', icon: 'time' },
            { name: 'Trial Cash', icon: 'ticket-percent' },
            { name: 'Mutual Funds', icon: 'chart-line' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.gridItem}>
              <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={theme.primary} />
              </View>
              <Text style={[styles.gridText, { color: theme.text }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fixed Savings Block */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Fixed Savings</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Save for rainy days and get high returns</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </View>
          <View style={styles.savingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.interestRate, { color: theme.success }]}>10%</Text>
              <Text style={[styles.interestLabel, { color: theme.textMuted }]}>Interest p.a.</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.durationText, { color: theme.text }]}>7-29 <Text style={styles.durationLabel}>Days</Text></Text>
              <Text style={[styles.interestLabel, { color: theme.textMuted }]}>Duration</Text>
            </View>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
           <View style={[styles.savingRow, { marginTop: 20 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.interestRate, { color: theme.success }]}>12%</Text>
              <Text style={[styles.interestLabel, { color: theme.textMuted }]}>Interest p.a.</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.durationText, { color: theme.text }]}>60-89 <Text style={styles.durationLabel}>Days</Text></Text>
              <Text style={[styles.interestLabel, { color: theme.textMuted }]}>Duration</Text>
            </View>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mutual Funds Preview */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Mutual Funds</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>More <Ionicons name="chevron-forward" size={12} /></Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Text style={[styles.rankNumber, { color: theme.accent }]}>1</Text>
             <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>ARM MONEY MARKET FUND</Text>
                <Text style={{ color: theme.success, fontSize: 13, marginTop: 4 }}>+16.86% <Text style={{ color: theme.textMuted }}>1Y Return</Text></Text>
             </View>
             <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.saveBtnText}>Invest</Text>
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
  assetsContainer: { borderRadius: 20, padding: 20, marginBottom: 25 },
  assetsHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  shieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  assetsLabel: { fontSize: 12, marginLeft: 6, fontWeight: '600' },
  totalAmount: { fontSize: 26, fontWeight: '800' },
  earningsAmount: { fontSize: 15, fontWeight: '800', marginTop: 8, textAlign: 'right' },
  dropdownIcon: { alignSelf: 'center', marginTop: 15 },
  expandedAssets: { marginTop: 15, borderTopWidth: 1, paddingTop: 15 },
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  assetName: { fontSize: 14, fontWeight: '500' },
  assetValue: { fontSize: 14, fontWeight: '700' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  gridItem: { width: '22%', alignItems: 'center', marginBottom: 20 },
  iconCircle: { borderRadius: 16, width: 48, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridText: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
  sectionCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { fontSize: 12, marginTop: 4 },
  savingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  interestRate: { fontSize: 20, fontWeight: '800' },
  interestLabel: { fontSize: 11, marginTop: 4 },
  durationText: { fontSize: 16, fontWeight: '800' },
  durationLabel: { fontSize: 11, fontWeight: '500' },
  saveButton: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 24 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  rankNumber: { fontSize: 28, fontWeight: '800', fontStyle: 'italic' }
});
