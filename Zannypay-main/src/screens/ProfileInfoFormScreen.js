import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileInfoFormScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtext}>Please enter your correct delivery and contact details below.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Hassan" 
            placeholderTextColor="#666"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Elebute" 
            placeholderTextColor="#666"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.prefix}>+234</Text>
            <TextInput 
              style={styles.phoneInput} 
              placeholder="0803 000 0000" 
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Address</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Street name, house no., landmark..." 
            placeholderTextColor="#666"
            multiline
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 20 },
  subtext: { color: '#999', fontSize: 14, marginBottom: 30 },
  formGroup: { marginBottom: 20 },
  label: { color: '#CCC', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', padding: 15, borderRadius: 12, fontSize: 15 },
  phoneInputContainer: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, alignItems: 'center' },
  prefix: { color: '#fff', paddingHorizontal: 15, borderRightWidth: 1, borderRightColor: '#333', fontSize: 15 },
  phoneInput: { flex: 1, color: '#FFF', padding: 15, fontSize: 15 },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  primaryButton: { backgroundColor: '#6C5CE7', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
