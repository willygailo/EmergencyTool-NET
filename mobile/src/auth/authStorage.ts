import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'token';
const REMEMBERED_CREDENTIALS_KEY = 'remembered_credentials';

export interface RememberedCredentials {
  email: string;
  password: string;
}

const canUseSecureStore = async () =>
  Platform.OS !== 'web' && (await SecureStore.isAvailableAsync());

const readSecureValue = async (key: string) => {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }

  return AsyncStorage.getItem(key);
};

const writeSecureValue = async (key: string, value: string) => {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  await AsyncStorage.setItem(key, value);
};

export const saveSessionToken = async (token: string) => {
  await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
};

export const getSessionToken = async () => AsyncStorage.getItem(SESSION_TOKEN_KEY);

export const clearSessionToken = async () => {
  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
};

export const saveRememberedCredentials = async (credentials: RememberedCredentials) => {
  await writeSecureValue(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(credentials));
};

export const getRememberedCredentials = async (): Promise<RememberedCredentials | null> => {
  const rawValue = await readSecureValue(REMEMBERED_CREDENTIALS_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!parsed?.email || !parsed?.password) {
      return null;
    }

    return {
      email: String(parsed.email),
      password: String(parsed.password),
    };
  } catch (_error) {
    return null;
  }
};
