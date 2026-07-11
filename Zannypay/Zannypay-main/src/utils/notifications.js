import AsyncStorage from '@react-native-async-storage/async-storage';

const READ_IDS_KEY = 'zannypay:notifications:readIds';

// Builds a notification feed from wallet transactions plus a couple of
// evergreen system messages. Kept separate from WalletContext so it can be
// reused anywhere (dashboard badge, notifications screen) without touching
// existing context code.
export function buildNotificationFeed(transactions = []) {
  const txnNotifications = (transactions || []).slice(0, 30).map((txn) => {
    const isCredit = txn.type === 'credit';
    const isInvoice = txn.type === 'invoice';
    let title = isInvoice ? 'Invoice Sent' : isCredit ? 'Money Received' : 'Payment Sent';
    let icon = isInvoice ? 'document-text' : isCredit ? 'arrow-down-circle' : 'arrow-up-circle';

    if (txn.category === 'Savings') { title = isCredit ? 'Savings Withdrawal' : 'Saved to Cashbox'; icon = 'wallet'; }
    if (txn.category === 'Flexi Credit') { title = isCredit ? 'Loan Disbursed' : 'Loan Repayment'; icon = 'card'; }

    return {
      id: `txn:${txn.id}`,
      title,
      body: txn.title,
      icon,
      timestamp: txn.createdAt || txn.date,
      txn,
    };
  });

  const systemNotifications = [
    {
      id: 'system:welcome',
      title: 'Welcome to Zannypay',
      body: 'Your account is fully set up. Explore Savings, Flexi Credit, and more.',
      icon: 'sparkles',
      timestamp: null,
    },
    {
      id: 'system:security',
      title: 'Security Tip',
      body: 'Enable biometric login in Settings for faster, safer access.',
      icon: 'shield-checkmark',
      timestamp: null,
    },
  ];

  return [...txnNotifications, ...systemNotifications];
}

export async function getReadIds() {
  try {
    const raw = await AsyncStorage.getItem(READ_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function markAllRead(ids) {
  try {
    await AsyncStorage.setItem(READ_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    // no-op — read state is a nice-to-have, never block the UI on it
  }
}

export async function getUnreadCount(transactions) {
  const feed = buildNotificationFeed(transactions);
  const readIds = await getReadIds();
  return feed.filter((n) => !readIds.includes(n.id)).length;
}
