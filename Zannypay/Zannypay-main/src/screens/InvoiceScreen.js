import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, Share } from 'react-native';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function InvoiceScreen({ navigation }) {
  const { user, recordInvoice } = useWallet();
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateInvoice = async () => {
    if (!clientName || !amount || !description) {
      Alert.alert('Missing Fields', 'Please fill in all details to generate an invoice.');
      return;
    }

    setLoading(true);
    
    // Simulate a brief processing delay for UX purposes
    setTimeout(async () => {
      setLoading(false);
      
      const invoiceText = `🧾 *INVOICE*\n\n*From:* ${user?.name || 'Freelancer'}\n*To:* ${clientName}\n\n*Description of Services:*\n${description}\n\n*Amount Due:* ₦${amount}\n\n*Payment Details:*\nBank: ZannyPay\nAccount: ${user?.accountNumber || user?.phone || '0000000000'}\n\nThank you for your business!`;
      
      try {
        await Share.share({
          message: invoiceText,
          title: `Invoice for ${clientName}`,
        });

        // Log it locally so it shows up in History and counts toward
        // the "Invoices Issued" figure on the Insights screen.
        await recordInvoice({ clientName, amount, description });

        // Reset fields after successful share intent
        setClientName('');
        setAmount('');
        setDescription('');
      } catch (error) {
        Alert.alert('Error', 'Failed to share the invoice.');
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Invoice</Text>
          <Text style={styles.subtitle}>Generate a professional payment request</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Client Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Acme Corp or John Doe"
            placeholderTextColor={colors.textMuted}
            value={clientName}
            onChangeText={setClientName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount (₦)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description / Services Rendered</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Logo Design, Web Development..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <GradientButton 
          title="Generate & Share Invoice" 
          onPress={handleGenerateInvoice} 
          loading={loading} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.textDark },
  textArea: { height: 100, textAlignVertical: 'top' },
});
