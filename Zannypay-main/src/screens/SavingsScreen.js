import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';
import GradientButton from '../components/GradientButton';
import AnimatedProgressBar from '../components/AnimatedProgressBar';
import FadeInView from '../components/FadeInView';

export default function SavingsScreen({ navigation }) {
  const theme = colors.dark;
  const {
    balance, isBalanceHidden, toggleBalanceHidden,
    savingsGoals, createSavingsGoal, depositToSavings, withdrawFromSavings, savingsApy,
  } = useWallet();

  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [creating, setCreating] = useState(false);

  const [actionVisible, setActionVisible] = useState(false);
  const [actionGoal, setActionGoal] = useState(null);
  const [actionMode, setActionMode] = useState('deposit'); // 'deposit' | 'withdraw'
  const [actionAmount, setActionAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const totalSaved = (savingsGoals || []).reduce((sum, g) => sum + (Number(g.saved) || 0), 0);
  const totalAssets = balance + totalSaved;

  const openAction = (goal, mode) => {
    setActionGoal(goal);
    setActionMode(mode);
    setActionAmount('');
    setActionVisible(true);
  };

  const handleCreateGoal = async () => {
    if (!goalName || !goalTarget) {
      Alert.alert('Missing details', 'Please enter a goal name and target amount.');
      return;
    }
    setCreating(true);
    const res = await createSavingsGoal({ name: goalName, target: goalTarget });
    setCreating(false);

    if (!res.ok) {
      Alert.alert('Could not create goal', res.error);
      return;
    }
    setGoalName('');
    setGoalTarget('');
    setCreateVisible(false);
  };

  const handleConfirmAction = async () => {
    if (!actionAmount) {
      Alert.alert('Enter an amount', 'Please enter how much you want to move.');
      return;
    }
    setActionLoading(true);
    const res = actionMode === 'deposit'
      ? await depositToSavings(actionGoal.id, actionAmount)
      : await withdrawFromSavings(actionGoal.id, actionAmount);
    setActionLoading(false);

    if (!res.ok) {
      Alert.alert('Action failed', res.error);
      return;
    }
    setActionVisible(false);
    Alert.alert(
      actionMode === 'deposit' ? 'Saved!' : 'Withdrawn',
      actionMode === 'deposit'
        ? `${formatCurrency(actionAmount)} moved into ${actionGoal.name}.`
        : `${formatCurrency(actionAmount)} moved back to your wallet.`
    );
    setActionAmount('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Wealth</Text>
        <TouchableOpacity onPress={() => setCreateVisible(true)}>
          <Ionicons name="add-circle-outline" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Total Assets Header Card — real balance + real Cashbox total */}
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
                  <Ionicons name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'} size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.totalAmount, { color: theme.text }]}>
                {isBalanceHidden ? '••••••' : formatCurrency(totalAssets)}
              </Text>
            </View>
            <View style={styles.assetsRight}>
              <Text style={[styles.assetsLabel, { color: theme.textMuted }]}>Earning up to</Text>
              <Text style={[styles.earningsAmount, { color: theme.success }]}>
                {Math.round(savingsApy * 100)}% p.a.
              </Text>
            </View>
          </View>

          {isAssetsExpanded && (
            <View style={[styles.expandedAssets, { borderTopColor: theme.border }]}>
              <View style={styles.assetRow}>
                <Text style={[styles.assetName, { color: theme.textMuted }]}>Wallet Balance</Text>
                <Text style={[styles.assetValue, { color: theme.text }]}>{isBalanceHidden ? '••••' : formatCurrency(balance)}</Text>
              </View>
              <View style={styles.assetRow}>
                <Text style={[styles.assetName, { color: theme.textMuted }]}>Cashbox (Savings Goals)</Text>
                <Text style={[styles.assetValue, { color: theme.success }]}>{isBalanceHidden ? '••••' : formatCurrency(totalSaved)}</Text>
              </View>
              <View style={styles.assetRow}>
                <Text style={[styles.assetName, { color: theme.textMuted }]}>Active Goals</Text>
                <Text style={[styles.assetValue, { color: theme.text }]}>{savingsGoals?.length || 0}</Text>
              </View>
            </View>
          )}
          <Ionicons name={isAssetsExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textMuted} style={styles.dropdownIcon} />
        </TouchableOpacity>

        {/* Goals list */}
        <View style={styles.goalsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Savings Goals</Text>
          <TouchableOpacity onPress={() => setCreateVisible(true)}>
            <Text style={[styles.newGoalLink, { color: theme.primary }]}>+ New Goal</Text>
          </TouchableOpacity>
        </View>

        {(!savingsGoals || savingsGoals.length === 0) ? (
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, alignItems: 'center' }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.surfaceAlt }]}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={30} color={theme.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No goals yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Create a savings goal — rent, a new phone, an emergency fund — and start growing it from your wallet.
            </Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: theme.primary }]} onPress={() => setCreateVisible(true)}>
              <Text style={styles.emptyBtnText}>Create your first goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savingsGoals.map((goal, idx) => {
            const saved = Number(goal.saved) || 0;
            const target = Number(goal.target) || 0;
            const pct = target > 0 ? (saved / target) * 100 : 0;
            return (
              <FadeInView key={goal.id} delay={idx * 60}>
                <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                  <View style={styles.goalTopRow}>
                    <Text style={[styles.goalName, { color: theme.text }]}>{goal.name}</Text>
                    <Text style={[styles.goalPct, { color: theme.success }]}>{Math.min(pct, 100).toFixed(0)}%</Text>
                  </View>
                  <AnimatedProgressBar percentage={pct} color={theme.success} trackColor={theme.border} />
                  <View style={styles.goalMetaRow}>
                    <Text style={[styles.goalSaved, { color: theme.text }]}>{formatCurrency(saved)} saved</Text>
                    <Text style={[styles.goalTarget, { color: theme.textMuted }]}>of {formatCurrency(target)}</Text>
                  </View>
                  <View style={[styles.goalActionsRow, { borderTopColor: theme.border }]}>
                    <TouchableOpacity style={styles.goalActionBtn} onPress={() => openAction(goal, 'deposit')}>
                      <Ionicons name="add-circle-outline" size={16} color={theme.success} />
                      <Text style={[styles.goalActionText, { color: theme.success }]}>Add Money</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.goalActionBtn} onPress={() => openAction(goal, 'withdraw')}>
                      <Ionicons name="arrow-undo-outline" size={16} color={theme.textMuted} />
                      <Text style={[styles.goalActionText, { color: theme.textMuted }]}>Withdraw</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeInView>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Savings Goal</Text>
            <Text style={[styles.label, { color: theme.textMuted }]}>Goal Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Emergency Fund"
              placeholderTextColor={theme.textMuted}
              value={goalName}
              onChangeText={setGoalName}
            />
            <Text style={[styles.label, { color: theme.textMuted }]}>Target Amount</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="₦0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={goalTarget}
              onChangeText={setGoalTarget}
            />
            <GradientButton title="Create Goal" onPress={handleCreateGoal} loading={creating} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deposit / Withdraw Modal */}
      <Modal visible={actionVisible} transparent animationType="fade" onRequestClose={() => setActionVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{actionMode === 'deposit' ? 'Add Money' : 'Withdraw'}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              {actionMode === 'deposit'
                ? `Wallet balance: ${formatCurrency(balance)}`
                : `Available in ${actionGoal?.name}: ${formatCurrency(Number(actionGoal?.saved) || 0)}`}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, textAlign: 'center', fontSize: 22 }]}
              placeholder="₦0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={actionAmount}
              onChangeText={setActionAmount}
              autoFocus
            />
            <GradientButton
              title={actionMode === 'deposit' ? 'Save It' : 'Withdraw'}
              onPress={handleConfirmAction}
              loading={actionLoading}
              style={{ marginTop: 20 }}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setActionVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  assetsLeft: {},
  assetsRight: { alignItems: 'flex-end' },
  shieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  assetsLabel: { fontSize: 12, marginLeft: 6, fontWeight: '600' },
  totalAmount: { fontSize: 26, fontWeight: '800' },
  earningsAmount: { fontSize: 15, fontWeight: '800', marginTop: 8, textAlign: 'right' },
  dropdownIcon: { alignSelf: 'center', marginTop: 15 },
  expandedAssets: { marginTop: 15, borderTopWidth: 1, paddingTop: 15 },
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  assetName: { fontSize: 14, fontWeight: '500' },
  assetValue: { fontSize: 14, fontWeight: '700' },
  goalsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  newGoalLink: { fontSize: 13, fontWeight: '700' },
  sectionCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  goalName: { fontSize: 15, fontWeight: '700' },
  goalPct: { fontSize: 13, fontWeight: '700' },
  goalMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  goalSaved: { fontSize: 12, fontWeight: '600' },
  goalTarget: { fontSize: 12 },
  goalActionsRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, paddingTop: 12 },
  goalActionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  goalActionText: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1 },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600' },
});
