import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/colors';

export default function SplashScreen() {
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <Text style={styles.logo}>Zannypay</Text>
      <Text style={styles.tagline}>Money, moved beautifully.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: '#E6DEFF', marginTop: 8 },
});
