import * as SecureStore from 'expo-secure-store';

export const SecureStorage = {
  // Save sensitive data (e.g., JWT tokens, user IDs)
  save: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`[SecureStorage] Saved encrypted key: ${key}`);
    } catch (error) {
      console.error(`[SecureStorage] Save error for ${key}:`, error);
    }
  },

  // Retrieve decrypted data
  get: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorage] Read error for ${key}:`, error);
      return null;
    }
  },

  // Delete data on logout
  remove: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`[SecureStorage] Removed key: ${key}`);
    } catch (error) {
      console.error(`[SecureStorage] Delete error for ${key}:`, error);
    }
  }
};
