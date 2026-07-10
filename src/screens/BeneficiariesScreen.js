import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput, Modal, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { saveJSON, loadJSON } from '../utils/storage';
import GradientButton from '../components/GradientButton';
import Card from '../components/Card';
import FadeInView from '../components/FadeInView';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = 'zannypay:beneficiaries';
const BANKS = ['Zannypay', 'Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'Kuda', 'Opay'];

export default function BeneficiariesScreen({ navigation }) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [bank, setBank] = useState(BANKS[0]);

  const load = useCallback(async () => {
    const saved = await loadJSON(STORAGE_KEY, []);
    setBeneficiaries(saved || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async () => {
    if (!name || !account) {
      Alert.alert('Missing details', 'Please enter a name and account number.');
      return;
    }
    const entry = { id: Date.now().toString(), name, account, bank };
    const updated = [entry, ...beneficiaries];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBeneficiaries(updated);
    await saveJSON(STORAGE_KEY, updated);
    setName('');
    setAccount('');
    setBank(BANKS[0]);
    setAddVisible(false);
  };

  const handleRemove = (id) => {
    Alert.alert('Remove Beneficiary', 'This will remove them from your saved recipients.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = beneficiaries.filter((b) => b.id !== id);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setBeneficiaries(updated);
          await saveJSON(STORAGE_KEY, updated);
        },
      },
    ]);
  };

  const handleSendTo = (item) => {
    navigation.navigate('Transfer', {
      prefillAccount: item.account,
      prefillBank: item.bank === 'Zannypay' ? null : item.bank,
      prefillName: item.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Recipients</Text>
        <TouchableOpacity onPress={() => setAddVisible(true)} style={styles.backBtn}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={beneficiaries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <FadeInView delay={index * 40}>
            <Card style={styles.row}>
              <TouchableOpacity style={styles.rowMain} onPress={() => handleSendTo(item)} activeOpacity={0.7}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowSub}>{item.bank} · {item.account}</Text>
                </View>
                <Ionicons name="paper-plane-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(item.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </Card>
          </FadeInView>
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="people-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Saved Recipients</Text>
            <Text style={styles.emptySub}>Add people you pay often for one-tap transfers.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setAddVisible(true)}>
              <Text style={styles.emptyBtnText}>Add Recipient</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={addVisible} transparent animationType="slide" onRequestClose={() => setAddVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Recipient</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="e.g. John Doe" value={name} onChangeText={setName} />

            <Text style={styles.label}>Account Number</Text>
            <TextInput style={styles.input} placeholder="0000000000" keyboardType="number-pad" value={account} onChangeText={setAccount} maxLength={10} />

            <Text style={styles.label}>Bank</Text>
            <View style={styles.bankRow}>
              {BANKS.map((b) => (
                <TouchableOpacity key={b} style={[styles.bankChip, bank === b && styles.bankChipActive]} onPress={() => setBank(b)}>
                  <Text style={[styles.bankChipText, bank === b && styles.bankChipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <GradientButton title="Save Recipient" onPress={handleAdd} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddVisible(false)}>
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
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  listContent: { padding: 20, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12 },
  rowMain: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { paddingLeft: 12 },
  emptyStateContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: colors.bgLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.textDark },
  bankRow: { flexDirection: 'row', flexWrap: 'wrap' },
  bankChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#fff' },
  bankChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  bankChipText: { fontSize: 12, color: colors.textDark, fontWeight: '600' },
  bankChipTextActive: { color: '#fff' },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontWeight: '600' },
});
