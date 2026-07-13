import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileInfoScreen({ navigation }) {
  const ProfileRow = ({ label, value, icon, showArrow = true }) => (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color="#888" style={{ marginRight: 12 }} />}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        {showArrow && <Ionicons name="chevron-forward" size={18} color="#666" style={{ marginLeft: 8 }} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>HE</Text>
            </View>
          </View>
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileName}>Hi, HASSAN</Text>
            <Text style={styles.loginText}>Last login: Today, 07:23 AM</Text>
          </View>
        </View>

        <View style={styles.section}>
          <ProfileRow label="Account Number" value="803 761 1259" icon="bank" />
          <ProfileRow label="Email" value="olderhn@gmail.com" icon="email" />
          <ProfileRow label="KYC Level" value="Tier 3" icon="shield-check" />
        </View>

        <View style={styles.section}>
          <ProfileRow label="Full Name" value="HASSAN ELEBUTE" />
          <ProfileRow label="Gender" value="Male" />
          <ProfileRow label="Mobile Number" value="0814 469 5494" />
          <ProfileRow label="Address" value="Tap to view" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, marginBottom: 20 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  profileHeaderInfo: { marginLeft: 15 },
  profileName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  loginText: { color: '#888', fontSize: 12 },
  section: { backgroundColor: '#1A1A1A', borderRadius: 16, marginBottom: 20, paddingVertical: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#252525' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { color: '#CCC', fontSize: 15 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { color: '#FFF', fontSize: 15, fontWeight: '500' }
});
