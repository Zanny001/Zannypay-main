import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// --- Background Bubble Component ---
const FloatingBubble = ({ size, left, delay, duration }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start delay
    setTimeout(() => {
      // 1. Float Upwards
      Animated.loop(
        Animated.timing(translateY, {
          toValue: -100,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // 2. Sway / Bounce left and right
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 20 + Math.random() * 20,
            duration: 1500 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -(20 + Math.random() * 20),
            duration: 1500 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();

      // 3. Fade In and Out
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.3, duration: duration * 0.2, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.1, duration: duration * 0.6, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: duration * 0.2, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: left,
          transform: [{ translateY }, { translateX }],
          opacity: opacity,
        }
      ]}
    />
  );
};

// Generate random bubbles
const bubbles = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  size: Math.random() * 40 + 10,
  left: Math.random() * width,
  delay: Math.random() * 5000,
  duration: 6000 + Math.random() * 6000,
}));


export default function TransactionReceiptScreen({ navigation }) {
  
  // Fake data based on PalmPay reference
  const txData = {
    amount: '₦ 2,000.00',
    date: 'Jul 13, 2026 3:55:54 PM',
    recipientName: 'KUDIRAT AYOMIDE ELEBUTE',
    recipientBank: 'OPay | 905 368 3551',
    senderName: 'HASSAN ELEBUTE',
    senderBank: 'Zannypay | 803***1259',
    txType: 'Transfer',
    txId: '0337jdjs3904',
    sessionId: '100033260713145558010080533999'
  };

  // Helper for dashed serrated edge effect
  const renderSerratedEdge = (isTop = true) => {
    return (
      <View style={[styles.serratedContainer, isTop ? styles.serratedTop : styles.serratedBottom]}>
        {Array.from({ length: Math.floor(width / 15) }).map((_, i) => (
          <View key={i} style={styles.serratedNotch} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Animations */}
      <View style={StyleSheet.absoluteFillObject}>
        {bubbles.map(b => (
          <FloatingBubble key={b.id} {...b} />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction receipt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Receipt Card */}
        <View style={styles.receiptWrapper}>
          <View style={styles.receiptCard}>
            
            {/* Header Logo */}
            <View style={styles.cardHeader}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>Z</Text>
              </View>
              <Text style={styles.logoName}>Zannypay</Text>
            </View>

            {/* Amount & Status */}
            <View style={styles.amountSection}>
              <Text style={styles.amountText}>{txData.amount}</Text>
              <Text style={styles.statusText}>Successful Transaction</Text>
              <Text style={styles.dateText}>{txData.date}</Text>
            </View>

            {/* Separator */}
            <View style={styles.dashedLine} />

            {/* Details */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient:</Text>
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValueBold}>{txData.recipientName}</Text>
                  <Text style={styles.detailValueSub}>{txData.recipientBank}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sender:</Text>
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValueBold}>{txData.senderName}</Text>
                  <Text style={styles.detailValueSub}>{txData.senderBank}</Text>
                </View>
              </View>
            </View>

            {/* Separator */}
            <View style={styles.dashedLine} />

            {/* Transaction Info */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Transaction Info:</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction Type</Text>
                <Text style={styles.infoValue}>{txData.txType}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction ID</Text>
                <Text style={styles.infoValue}>{txData.txId}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Session ID</Text>
                <Text style={styles.infoValue}>{txData.sessionId}</Text>
              </View>
            </View>

            {/* Footer Text */}
            <Text style={styles.receiptFooterText}>Enjoy Seamless and Unlimited Free Transfers to All Banks.</Text>

          </View>
          
          {/* Serrated Edges overlaying the card to give the receipt feel */}
          {renderSerratedEdge(true)}
          {renderSerratedEdge(false)}
        </View>

        {/* Theme Selector (Mocking the PalmPay bottom section) */}
        <View style={styles.themeSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeScroll}>
            {[
              { id: '1', name: 'Receipt', color: '#6C5CE7', icon: 'receipt' },
              { id: '2', name: 'Wishes', color: '#00B894', icon: 'gift' },
              { id: '3', name: 'Birthday', color: '#FF7675', icon: 'cake' },
              { id: '4', name: 'Valentine', color: '#E84393', icon: 'heart' },
              { id: '5', name: 'Wedding', color: '#FDCB6E', icon: 'ring' },
            ].map((theme, index) => (
              <TouchableOpacity key={theme.id} style={styles.themeBtn}>
                <View style={[styles.themeIconBox, { backgroundColor: theme.color + '20' }]}>
                  <MaterialCommunityIcons name={theme.icon} size={28} color={theme.color} />
                  {index === 0 && (
                    <View style={styles.themeCheck}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={[styles.themeText, index === 0 && styles.themeTextActive]}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionFooter}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color="#6C5CE7" />
          <Text style={styles.actionBtnText}>Share as Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="download-outline" size={20} color="#6C5CE7" />
          <Text style={styles.actionBtnText}>Save as PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  bubble: { position: 'absolute', backgroundColor: '#6C5CE7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, zIndex: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30, zIndex: 10 },
  
  // Receipt Card
  receiptWrapper: { position: 'relative', marginVertical: 15 },
  receiptCard: { backgroundColor: '#161616', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 30, overflow: 'hidden' },
  serratedContainer: { flexDirection: 'row', position: 'absolute', left: 0, right: 0, justifyContent: 'space-around', overflow: 'hidden' },
  serratedTop: { top: -6 },
  serratedBottom: { bottom: -6 },
  serratedNotch: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0A0A0A' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  logoCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoName: { color: '#fff', fontSize: 16, fontWeight: '600' },

  amountSection: { alignItems: 'center', marginBottom: 25 },
  amountText: { color: '#8C7AEE', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  statusText: { color: '#CCC', fontSize: 15, fontWeight: '500', marginBottom: 6 },
  dateText: { color: '#666', fontSize: 12 },

  dashedLine: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 1, marginVertical: 15 },

  detailsSection: { marginVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  detailLabel: { color: '#777', fontSize: 14 },
  detailValueContainer: { alignItems: 'flex-end', flex: 1, paddingLeft: 20 },
  detailValueBold: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 4, textAlign: 'right' },
  detailValueSub: { color: '#777', fontSize: 12, textAlign: 'right' },

  sectionTitle: { color: '#AAA', fontSize: 14, fontWeight: '600', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: '#777', fontSize: 13 },
  infoValue: { color: '#CCC', fontSize: 13, textAlign: 'right', width: '60%' },

  receiptFooterText: { color: '#555', fontSize: 11, textAlign: 'center', marginTop: 30, marginBottom: 10 },

  // Themes Section
  themeSection: { marginTop: 10 },
  themeScroll: { paddingVertical: 10 },
  themeBtn: { alignItems: 'center', marginRight: 20 },
  themeIconBox: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  themeCheck: { position: 'absolute', top: -5, right: -5, backgroundColor: '#6C5CE7', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0A0A0A' },
  themeText: { color: '#777', fontSize: 12, marginTop: 8, fontWeight: '600' },
  themeTextActive: { color: '#6C5CE7' },

  // Footer Actions
  actionFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1A1A1A', zIndex: 10, backgroundColor: '#0A0A0A' },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  actionBtnText: { color: '#6C5CE7', fontSize: 15, fontWeight: '600', marginLeft: 10 }
});
