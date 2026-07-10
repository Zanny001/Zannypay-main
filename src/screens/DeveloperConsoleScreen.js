import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function DeveloperConsoleScreen() {
  const [logs, setLogs] = useState([
    { time: '00:10:01', method: 'GET', path: '/api/v1/wallet/balance', status: 200 },
    { time: '00:10:02', method: 'POST', path: '/api/v1/auth/verify-otp', status: 200 }
  ]);
  const [apiKey, setApiKey] = useState('sk_live_••••••••••••••••••••');

  const generateNewKey = () => {
    const randomHex = [...Array(24)].map(() => Math.floor(Math.random()*16).toString(16)).join('');
    setApiKey(`sk_live_${randomHex}`);
    
    setLogs(prev => [
      ...prev,
      { time: new Date().toTimeString().split(' ')[0], method: 'POST', path: '/api/v1/dev/keys/generate', status: 201 }
    ]);
    Alert.alert('API Key Generated', 'Your new production secret token has been provisioned successfully.');
  };

  const clearLogs = () => setLogs([]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Developer Engine</Text>
          <Text style={styles.subtitle}>Mobile core sandbox instrumentation</Text>
        </View>

        <Text style={styles.sectionTitle}>Production API Credentials</Text>
        <View style={styles.keyBox}>
          <Text style={styles.keyText}>{apiKey}</Text>
          <TouchableOpacity onPress={generateNewKey} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.terminalHeader}>
          <Text style={styles.sectionTitle}>Live Webhook & Request Logs</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Terminal Window Graphic Component */}
        <View style={styles.terminal}>
          {logs.length === 0 ? (
            <Text style={styles.terminalGhost}>Listening for inbound connection objects...</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logRow}>
                <Text style={styles.logTime}>[{log.time}]</Text>
                <Text style={[styles.logMethod, { color: log.method === 'POST' ? '#00C2FF' : '#F5B700' }]}>{log.method}</Text>
                <Text style={styles.logPath}>{log.path}</Text>
                <Text style={[styles.logStatus, { color: log.status >= 200 && log.status < 300 ? '#00FF66' : '#FF3B30' }]}>{log.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  keyBox: { backgroundColor: '#fff', borderRadius: 12, borderHorizontal: 1, borderColor: colors.border, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: colors.border },
  keyText: { fontFamily: 'monospace', fontSize: 13, color: colors.textDark },
  refreshBtn: { backgroundColor: colors.primary, width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  terminalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  terminal: { backgroundColor: '#111', borderRadius: 14, padding: 16, minHeight: 220, fontFamily: 'monospace' },
  terminalGhost: { color: '#666', fontFamily: 'monospace', fontSize: 12, fontStyle: 'italic' },
  logRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  logTime: { color: '#555', fontFamily: 'monospace', fontSize: 12, marginRight: 6 },
  logMethod: { fontWeight: '700', fontFamily: 'monospace', fontSize: 12, width: 45 },
  logPath: { color: '#EEE', fontFamily: 'monospace', fontSize: 12, flex: 1, paddingHorizontal: 4 },
  logStatus: { fontFamily: 'monospace', fontSize: 12, fontWeight: '600' }
});
