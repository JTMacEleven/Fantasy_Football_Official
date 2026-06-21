import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'afroangel_auth_token';
const REMEMBER_KEY = 'afroangel_remember_me';

export async function saveSession(token: string, rememberMe: boolean) {
  await AsyncStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');

  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }

  if (rememberMe) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
}

export async function loadToken() {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  const rememberMe = (await AsyncStorage.getItem(REMEMBER_KEY)) === '1';
  if (rememberMe) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REMEMBER_KEY]);
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  }
}

export async function isRememberMeEnabled() {
  return (await AsyncStorage.getItem(REMEMBER_KEY)) === '1';
}
