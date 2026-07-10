import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import AnimatedProgressBar from '../components/AnimatedProgressBar';
import FadeInView from '../components/FadeInView';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SavingsScreen({ navigation }) {
  const { savingsGoals, createSavingsGoal, depositToSavings, withdrawFromSavings, savingsApy, balance } = useWallet();

  const [createVisible, setCreateVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const [actionVisible, setActionVisible] = useState(false);
  const [actionGoal, setActionGoal] = useState(null);
  const [actionMode, setActionMode] = useState('deposit'); // 'deposit' | 'withdraw'
  const [actionAmount, setActionAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSaved = (savingsGoals || []).reduce((sum, g) => sum + (g.saved || 0), 0);

  const openAction = (goal, mode) => {
    setActionGoal(goal);
    setActionMode(mode);
    setActionAmount('');
    setActionVisible(true);
  };

  const handleCreateGoal = async () => {
    const res = await createSavingsGoal({ name: goalName, target: goalTarget });
    if (!res.ok) {
      Alert.alert('Could not create goal', res.error);
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGoalName('');
    setGoalTarget('');
    setCreateVisible(false);
  };

  const handleConfirmAction = async () => {
    setLoading(true);
    const res = actionMode === 'deposit'
      ? await depositToSavings(actionGoal.id, actionAmount)
      : await withdrawFromSavings(actionGoal.id, actionAmount);
    setLoading(false);

    if (!res.ok) {
      Alert.alert('Action failed', res.error);
      return;
    }
    setActionVisible(false);
    setActionAmount('');
    Alert.alert(
      actionMode === 'deposit' ? 'Saved!' : 'Withdrawn',
      actionMode === 'deposit'
        ? `${formatCurrency(actionAmount)} moved into ${actionGoal.name}.`
        : `${formatCurrency(actionAmount)} moved back to your wallet.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Save & Grow</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <LinearGradient colors={gradients.savings} style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total in Cashbox</Text>
            <Text style={styles.heroValue}>{formatCurrency(totalSaved)}</Text>
            <View style={styles.apyPill}>
              <Ionicons name="trending-up" size={14} color="#fff" />
              <Text style={styles.apyText}>Earning up to {Math.round(savingsApy * 100)}% p.a.</Text>
            </View>
          </LinearGradient>
        </FadeInView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <TouchableOpacity onPress={() => setCreateVisible(true)}>
            <Text style={styles.newGoalLink}>+ New Goal</Text>
          </TouchableOpacity>
        </View>

        {(!savingsGoals || savingsGoals.length === 0) ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="rocket-outline" size={30} color={colors.savingsGreen} />
            </View>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySub}>Create a savings goal — a new phone, rent, or an emergency fund — and watch it grow.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setCreateVisible(true)}>
              <Text style={styles.emptyBtnText}>Create your first goal</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          savingsGoals.map((goal, idx) => {
            const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
            return (
              <FadeInView key={goal.id} delay={idx * 60}>
                <Card style={styles.goalCard}>
                  <View style={styles.goalTopRow}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalPct}>{Math.min(pct, 100).toFixed(0)}%</Text>
                  </View>
                  <AnimatedProgressBar percentage={pct} color={colors.savingsGreen} />
                  <View style={styles.goalMetaRow}>
                    <Text style={styles.goalSaved}>{formatCurrency(goal.saved)} saved</Text>
                    <Text style={styles.goalTarget}>of {formatCurrency(goal.target)}</Text>
                  </View>
                  <View style={styles.goalActionsRow}>
                    <TouchableOpacity style={styles.goalActionBtn} onPress={() => openAction(goal, 'deposit')}>
                      <Ionicons name="add-circle-outline" size={16} color={colors.savingsGreen} />
                      <Text style={[styles.goalActionText, { color: colors.savingsGreen }]}>Add Money</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.goalActionBtn} onPress={() => openAction(goal, 'withdraw')}>
                      <Ionicons name="arrow-undo-outline" size={16} color={colors.textMuted} />
                      <Text style={styles.goalActionText}>Withdraw</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </FadeInView>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>
            <Text style={styles.label}>Goal Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Emergency Fund" value={goalName} onChangeText={setGoalName} />
            <Text style={styles.label}>Target Amount</Text>
            <TextInput style={styles.input} placeholder="₦0.00" keyboardType="numeric" value={goalTarget} onChangeText={setGoalTarget} />
            <GradientButton title="Create Goal" onPress={handleCreateGoal} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deposit / Withdraw Modal */}
      <Modal visible={actionVisible} transparent animationType="fade" onRequestClose={() => setActionVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{actionMode === 'deposit' ? 'Add Money' : 'Withdraw'}</Text>
            <Text style={styles.modalSubtitle}>
              {actionMode === 'deposit'
                ? `Wallet balance: ${formatCurrency(balance)}`
                : `Available in ${actionGoal?.name}: ${formatCurrency(actionGoal?.saved || 0)}`}
            </Text>
            <TextInput
              style={[styles.input, { textAlign: 'center', fontSize: 22 }]}
              placeholder="₦0.00"
              keyboardType="numeric"
              value={actionAmount}
              onChangeText={setActionAmount}
              autoFocus
            />
            <GradientButton
              title={actionMode === 'deposit' ? 'Save It' : 'Withdraw'}
              onPress={handleConfirmAction}
              loading={loading}
              style={{ marginTop: 20 }}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setActionVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  scroll: { padding: 20 },
  heroCard: { borderRadius: 20, padding: 24, marginBottom: 24 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 6 },
  apyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, marginTop: 14 },
  apyText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  newGoalLink: { fontSize: 13, fontWeight: '700', color: colors.savingsGreen },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E7F8EF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 12 },
  emptyBtn: { backgroundColor: colors.savingsGreen, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  goalCard: { marginBottom: 14, padding: 18 },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  goalName: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  goalPct: { fontSize: 13, fontWeight: '700', color: colors.savingsGreen },
  goalMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  goalSaved: { fontSize: 12, color: colors.textDark, fontWeight: '600' },
  goalTarget: { fontSize: 12, color: colors.textMuted },
  goalActionsRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  goalActionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  goalActionText: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: colors.bgLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.textDark },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontWeight: '600' },
});
