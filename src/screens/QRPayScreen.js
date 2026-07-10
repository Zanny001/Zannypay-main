import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Share, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { maskAccount } from '../utils/format';
import GradientButton from '../components/GradientButton';
import FadeInView from '../components/FadeInView';

// Deterministically derives a pixel pattern from the account number so the
// same account always renders the same "code" — a lightweight, dependency
// -free stand-in for a real QR graphic that keeps the whole stack on the
// exact package versions already pinned for Snack compatibility.
function useCodePattern(seedString, size = 7) {
  return useMemo(() => {
    const seed = String(seedString || '0000000000');
    const cells = [];
    for (let i = 0; i < size * size; i++) {
      const charCode = seed.charCodeAt(i % seed.length) || 48;
      cells.push(((charCode * (i + 7)) % 5) === 0);
    }
    return cells;
  }, [seedString, size]);
}

export default function QRPayScreen({ navigation }) {
  const { user } = useWallet();
  const accountNumber = user?.accountNumber || user?.phone || '0000000000';
  const pattern = useCodePattern(accountNumber);

  const [requestAmount, setRequestAmount] = useState('');
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] });

  const handleShare = async () => {
    const amountLine = requestAmount ? `\nRequested Amount: ₦${requestAmount}` : '';
    try {
      await Share.share({
        message: `Pay me instantly on Zannypay 💜\n\nName: ${user?.name || 'Zannypay User'}\nAccount: ${accountNumber}${amountLine}\n\nOpen Zannypay and send to this account number.`,
      });
    } catch (e) {
      // Share sheet dismissed — nothing to do
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Zanny Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <FadeInView style={styles.scroll}>
        <View style={styles.codeWrap}>
          <Animated.View style={[styles.glow, { transform: [{ scale: glowScale }], opacity: glowOpacity }]} />
          <View style={styles.codeCard}>
            <View style={styles.grid}>
              {pattern.map((filled, i) => (
                <View key={i} style={styles.cell}>
                  <View style={[styles.cellInner, filled && styles.cellInnerFilled]} />
                </View>
              ))}
            </View>
            <Text style={styles.codeCaption}>Show this to receive money instantly</Text>
          </View>
        </View>

        <View style={styles.identityBlock}>
          <Text style={styles.name}>{user?.name || 'Zannypay Member'}</Text>
          <Text style={styles.account}>{maskAccount(accountNumber)} · Zannypay</Text>
        </View>

        <View style={styles.requestBlock}>
          <Text style={styles.label}>Request a specific amount (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="₦0.00"
            keyboardType="numeric"
            value={requestAmount}
            onChangeText={setRequestAmount}
          />
        </View>

        <GradientButton title="Share My Code" onPress={handleShare} style={{ marginTop: 24 }} />
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  scroll: { padding: 24, alignItems: 'center' },
  codeWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 24 },
  glow: { position: 'absolute', width: 240, height: 240, borderRadius: 28, backgroundColor: colors.primary },
  codeCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  grid: { width: 168, height: 168, flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: `${100 / 7}%`, padding: 2 },
  cellInner: { flex: 1, borderRadius: 3, backgroundColor: 'transparent' },
  cellInnerFilled: { backgroundColor: colors.textDark },
  codeCaption: { fontSize: 12, color: colors.textMuted, marginTop: 14, textAlign: 'center' },
  identityBlock: { alignItems: 'center', marginBottom: 20 },
  name: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  account: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  requestBlock: { width: '100%', marginTop: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.textDark, width: '100%' },
});
