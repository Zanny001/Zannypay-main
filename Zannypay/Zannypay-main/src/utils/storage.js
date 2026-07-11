import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage save error', e);
  }
}

export async function loadJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('storage load error', e);
    return fallback;
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('storage remove error', e);
  }
}
