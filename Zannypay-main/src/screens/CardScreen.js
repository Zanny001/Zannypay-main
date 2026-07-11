
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';

export default function CardScreen() {
  const { user, requestVirtualCard, toggleCardFreeze } = useWallet();
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Grab the first card from the user's profile
  const activeCard = user?.cards?.[0];

  const handleToggleFreeze = async () => {
    if (!activeCard) return;
    setLoading(true);
    try {
      await toggleCardFreeze(activeCard.id, !activeCard.isFrozen);
      Alert.alert(
        activeCard.isFrozen ? 'Card Unfrozen' : 'Card Frozen',
        activeCard.isFrozen ? 'Your virtual card is now active for transactions.' : 'Your virtual card has been temporarily locked.'
      );
    } catch (error) {
      Alert.alert('Error', 'Could not update card status.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCard = async () => {
    setLoading(true);
    try {
      await requestVirtualCard();
      Alert.alert('Success', 'Your virtual card has been generated!');
    } catch (error) {
      Alert.alert('Error', 'Could not generate virtual card.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>Zanny Cards</Text>
            <Text style={styles.subtitle}>Get a premium virtual multi-currency card</Text>
          </View>
          <View style={styles.noCardContainer}>
            <Ionicons name="card-outline" size={64} color={colors.textMuted} />
            <Text style={styles.noCardText}>You don't have a virtual card yet.</Text>
            <GradientButton 
              title="Generate Virtual Card" 
              onPress={handleRequestCard} 
              loading={loading} 
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Zanny Cards</Text>
          <Text style={styles.subtitle}>Premium virtual multi-currency card</Text>
        </View>

        {/* Dynamic Card Rendering */}
        <View style={[styles.creditCard, activeCard.isFrozen && styles.frozenCard]}>
          <View style={styles.cardTop}>
            <Text style={styles.cardType}>{activeCard.type || 'VIRTUAL ULTRA'}</Text>
            <Ionicons name="card" size={28} color={activeCard.isFrozen ? '#888' : '#F5B700'} />
          </View>

          <Text style={styles.cardNumber}>
            {showDetails && !activeCard.isFrozen 
              ? activeCard.cardNumber.replace(/(.{4})/g, '$1  ').trim() 
              : `••••  ••••  ••••  ${activeCard.cardNumber.slice(-4)}`}
          </Text>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardHolder}>{user?.name?.toUpperCase()}</Text>
            </View>
            <View style={styles.cardExpiryRow}>
              <View style={{ marginRight: 20 }}>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardValue}>{showDetails && !activeCard.isFrozen ? activeCard.expiry : '••/••'}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>CVV</Text>
                <Text style={styles.cardValue}>{showDetails && !activeCard.isFrozen ? activeCard.cvv : '•••'}</Text>
              </View>
            </View>
          </View>
          {activeCard.isFrozen && <View style={styles.frozenOverlay}><Text style={styles.frozenText}>FROZEN</Text></View>}
        </View>

        {/* Controls */}
        <Card style={styles.controlCard}>
          <View style={styles.controlRow}>
            <View style={styles.controlMeta}>
              <Ionicons name={activeCard.isFrozen ? 'lock-open-outline' : 'lock-closed-outline'} size={22} color={colors.textDark} />
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.controlTitle}>Freeze Card</Text>
                <Text style={styles.controlDesc}>Temporarily lock transactions</Text>
              </View>
            </View>
            {loading ? (
               <ActivityIndicator color={colors.primary} />
            ) : (
               <Switch 
                 value={activeCard.isFrozen} 
                 onValueChange={handleToggleFreeze} 
                 trackColor={{ false: '#ddd', true: colors.primary }} 
               />
            )}
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.controlRow}
            onPress={() => !activeCard.isFrozen && setShowDetails(!showDetails)}
            disabled={activeCard.isFrozen}
          >
            <View style={styles.controlMeta}>
              <Ionicons name={showDetails ? 'eye-off-outline' : 'eye-outline'} size={22} color={activeCard.isFrozen ? '#bbb' : colors.textDark} />
              <View style={{ marginLeft: 14 }}>
                <Text style={[styles.controlTitle, activeCard.isFrozen && { color: '#bbb' }]}>Reveal Details</Text>
                <Text style={styles.controlDesc}>View secure PAN, Expiry, and CVV</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={activeCard.isFrozen ? '#bbb' : '#ccc'} />
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

// ... Keep your existing styles down here!
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
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  noCardContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  noCardText: { color: colors.textDark, fontSize: 16, marginTop: 16, marginBottom: 24, fontWeight: '500' }
});

