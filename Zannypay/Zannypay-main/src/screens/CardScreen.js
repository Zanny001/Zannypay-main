import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';

export default function CardScreen() {
  const { user } = useWallet();
  const [isFrozen, setIsFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const toggleFreeze = () => {
    setIsFrozen(!isFrozen);
    Alert.alert(
      isFrozen ? 'Card Unfrozen' : 'Card Frozen',
      isFrozen ? 'Your virtual card is now active for transactions.' : 'Your virtual card has been temporarily locked.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Zanny Cards</Text>
          <Text style={styles.subtitle}>Premium virtual multi-currency card</Text>
        </View>

        {/* Premium Dark Virtual Card Component */}
        <View style={[styles.creditCard, isFrozen && styles.frozenCard]}>
          <View style={styles.cardTop}>
            <Text style={styles.cardType}>VIRTUAL ULTRA</Text>
            <Ionicons name="card" size={28} color={isFrozen ? '#888' : '#F5B700'} />
          </View>
          
          <Text style={styles.cardNumber}>
            {showDetails && !isFrozen ? '5412  7589  2491  4032' : '••••  ••••  ••••  4032'}
          </Text>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardHolder}>{user?.name?.toUpperCase() || 'FINTECH PRO'}</Text>
            </View>
            <View style={styles.cardExpiryRow}>
              <View style={{ marginRight: 20 }}>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardValue}>{showDetails && !isFrozen ? '09/30' : '••/••'}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>CVV</Text>
                <Text style={styles.cardValue}>{showDetails && !isFrozen ? '294' : '•••'}</Text>
              </View>
            </View>
          </View>
          {isFrozen && <View style={styles.frozenOverlay}><Text style={styles.frozenText}>FROZEN</Text></View>}
        </View>

        {/* Controls Layout */}
        <Card style={styles.controlCard}>
          <View style={styles.controlRow}>
            <View style={styles.controlMeta}>
              <Ionicons name={isFrozen ? 'lock-open-outline' : 'lock-closed-outline'} size={22} color={colors.textDark} />
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.controlTitle}>Freeze Card</Text>
                <Text style={styles.controlDesc}>Temporarily lock transactions</Text>
              </View>
            </View>
            <Switch value={isFrozen} onValueChange={toggleFreeze} trackColor={{ false: '#ddd', true: colors.primary }} />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.controlRow} 
            onPress={() => !isFrozen && setShowDetails(!showDetails)}
            disabled={isFrozen}
          >
            <View style={styles.controlMeta}>
              <Ionicons name={showDetails ? 'eye-off-outline' : 'eye-outline'} size={22} color={isFrozen ? '#bbb' : colors.textDark} />
              <View style={{ marginLeft: 14 }}>
                <Text style={[styles.controlTitle, isFrozen && { color: '#bbb' }]}>Reveal Details</Text>
                <Text style={styles.controlDesc}>View secure PAN, Expiry, and CVV</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isFrozen ? '#bbb' : '#ccc'} />
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  wrapper: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  creditCard: { height: 200, backgroundColor: '#111', borderRadius: 16, padding: 24, justifyContent: 'space-between', position: 'relative', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  frozenCard: { backgroundColor: '#2A2A2A', opacity: 0.8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { color: '#AAA', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  cardNumber: { color: '#fff', fontSize: 21, fontWeight: '700', letterSpacing: 3, marginVertical: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { color: '#666', fontSize: 9, fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
  cardHolder: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  cardExpiryRow: { flexDirection: 'row' },
  cardValue: { color: '#fff', fontSize: 13, fontWeight: '600' },
  frozenOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  frozenText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 4, borderWidth: 2, borderColor: '#fff', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  controlCard: { marginTop: 30, paddingVertical: 6 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  controlMeta: { flexDirection: 'row', alignItems: 'center' },
  controlTitle: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  controlDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 }
});
