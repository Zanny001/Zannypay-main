import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Card({ children, style }) {
  // Using the dark surface as the base structural card
  return <View style={[styles.card, { backgroundColor: colors.dark.surface }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
