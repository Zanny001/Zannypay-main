import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatDate } from '../utils/format';
import { buildNotificationFeed, getReadIds, markAllRead } from '../utils/notifications';
import Card from '../components/Card';
import FadeInView from '../components/FadeInView';

export default function NotificationsScreen({ navigation }) {
  const { transactions } = useWallet();
  const [feed, setFeed] = useState([]);
  const [readIds, setReadIds] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const built = buildNotificationFeed(transactions);
        const currentReadIds = await getReadIds();
        setFeed(built);
        setReadIds(currentReadIds);

        // Mark everything currently visible as read once the user opens the center.
        const allIds = built.map((n) => n.id);
        const merged = Array.from(new Set([...currentReadIds, ...allIds]));
        await markAllRead(merged);
      };
      load();
    }, [transactions])
  );

  const handlePress = (item) => {
    if (item.txn) {
      navigation.navigate('TransactionDetail', { txn: item.txn });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const wasUnread = !readIds.includes(item.id);
          return (
            <FadeInView delay={index * 30}>
              <TouchableOpacity activeOpacity={item.txn ? 0.7 : 1} onPress={() => handlePress(item)}>
                <Card style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{item.title}</Text>
                      {wasUnread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                    {!!item.timestamp && <Text style={styles.time}>{formatDate(item.timestamp)}</Text>}
                  </View>
                </Card>
              </TouchableOpacity>
            </FadeInView>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>New alerts about your wallet will show up here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  listContent: { padding: 20, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 8 },
  body: { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 17 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  emptyStateContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
