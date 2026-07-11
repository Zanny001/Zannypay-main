import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import GradientButton from './GradientButton';

// Catches render-time errors anywhere below it in the tree so a bug in one
// screen shows a recoverable error state instead of a blank/crashed app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            Zannypay ran into an unexpected error. Your funds and data are safe — try again.
          </Text>
          <GradientButton title="Try Again" onPress={this.handleReset} style={{ marginTop: 24, width: 200 }} />
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
});
