import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'flash',
    title: 'Instant Transfers',
    desc: 'Send money to any bank in seconds, anytime, anywhere.',
  },
  {
    icon: 'receipt',
    title: 'Pay Bills Effortlessly',
    desc: 'Airtime, data, electricity and TV subscriptions in one tap.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Bank-Grade Security',
    desc: 'Your money and data are protected with PIN and encryption.',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useWallet();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.footer}>
        <GradientButton
          title={index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0EBFC',
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginBottom: 10, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
});
