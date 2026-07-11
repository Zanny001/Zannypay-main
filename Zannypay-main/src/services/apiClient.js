import { Platform, Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SyncEngine } from './SyncEngine';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://zannypay-backend.onrender.com/api/v1';

// ==========================================
// TOKEN MANAGEMENT
// ==========================================
export const getSavedToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('userToken');
  return await SecureStore.getItemAsync('userToken');
};

export const saveToken = async (token) => {
  if (!token) return; // Prevent saving empty tokens
  if (Platform.OS === 'web') localStorage.setItem('userToken', token);
  else await SecureStore.setItemAsync('userToken', token);
};

export const clearToken = async () => {
  if (Platform.OS === 'web') localStorage.removeItem('userToken');
  else await SecureStore.deleteItemAsync('userToken');
};

// ==========================================
// USSD FALLBACK SYSTEM
// ==========================================
const triggerUssdFallback = (fallbackConfig) => {
  if (!fallbackConfig) return;
  const { type, amount, account } = fallbackConfig;
  
  let ussdString = '';
  if (type === 'transfer') ussdString = `*999*${amount}*${account}#`; 
  else if (type === 'airtime') ussdString = `*999*${amount}#`;
  else return;

  // iOS/Android require the '#' to be URL-encoded as '%23' for dialer links
  const encodedUssd = ussdString.replace('#', '%23');

  Alert.alert(
    'Network Connection Dropped 📡',
    `We couldn't reach the server. Would you like to complete this transaction securely offline via USSD?\n\nCode: ${ussdString}`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dial Code', onPress: () => Linking.openURL(`tel:${encodedUssd}`) }
    ]
  );
};

// ==========================================
// API FETCH HELPERS
// ==========================================
const buildHeaders = async () => {
  const headers = { 'Content-Type': 'application/json' };
  const savedToken = await getSavedToken();
  
  // Guard against the "undefined" or "null" string trap from local storage
  if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
    headers.Authorization = `Bearer ${savedToken}`;
  }
  return headers;
};

// NestJS's ValidationPipe often responds with `message` as an ARRAY of
// strings when several fields fail validation at once (e.g. ["amount must
// not be less than 1", "property bank should not exist"]). Joining it into
// a single readable string keeps every Alert.alert()/Text call downstream
// safe, since React Native can't render a raw array as text.
const extractErrorMessage = (data, fallback) => {
  const raw = data?.message || data?.error || fallback;
  if (Array.isArray(raw)) return raw.join(' ');
  return raw || fallback;
};

export const apiGet = async (endpoint) => {
  try {
    const headers = await buildHeaders();
    console.log(`[API GET] Request: ${endpoint}`);

    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    const data = await response.json().catch(() => ({}));
    
    console.log(`[API GET] Response from ${endpoint}:`, data);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'API GET request failed'));
    }
    return data;
  } catch (error) {
    console.error(`[API GET Error] ${endpoint}:`, error.message);
    throw error;
  }
};

export const apiPost = async (endpoint, payload, fallbackConfig = null, isRetry = false) => {
  try {
    const headers = await buildHeaders();
    console.log(`[API POST] Request: ${endpoint}`, payload);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.log(`[API POST] Response from ${endpoint}:`, data);

    if (!response.ok) {
      // Prioritize the exact message sent back from NestJS exceptions
      throw new Error(extractErrorMessage(data, 'API POST request failed'));
    }
    return data;
  } catch (error) {
    console.error(`[API POST Error] ${endpoint}:`, error.message);
    
    // Intercept genuine network failures (fetch throws TypeError on drops)
    if (error.name === 'TypeError' || error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      // Queue the real request for retry once connectivity returns, in
      // addition to offering the instant USSD fallback for right now.
      if (!isRetry) await SyncEngine.enqueue('POST_RETRY', { endpoint, payload });
      if (fallbackConfig) triggerUssdFallback(fallbackConfig);
      throw new Error('Network offline. Attempting USSD fallback.');
    }
    throw error;
  }
};
