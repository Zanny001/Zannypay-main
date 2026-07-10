import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SyncEngine } from './src/services/SyncEngine';
import { apiPost } from './src/services/apiClient';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  // Fire the Sync Engine on startup to replay any requests that failed
  // while offline (e.g. a transfer or bill payment) against the real API.
  useEffect(() => {
    SyncEngine.processQueue(async (item) => {
      if (item.type === 'POST_RETRY' && item.payload?.endpoint) {
        await apiPost(item.payload.endpoint, item.payload.payload, null, true);
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <WalletProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </WalletProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

