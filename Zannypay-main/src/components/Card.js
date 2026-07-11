import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Card({ children, style }) {
  // Defaults to a light surface: most screens using this component
  // (Support, Beneficiaries, Notifications, Analytics rows) render dark
  // text on top of it. Screens that want the dark-mode surface pass their
  // own `backgroundColor: theme.surface` in `style`, which overrides this.
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});
