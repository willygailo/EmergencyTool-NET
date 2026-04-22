import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const extractHost = (value?: string | null) => {
  if (!value) {
    return null;
  }

  try {
    if (value.includes('://')) {
      return new URL(value).hostname;
    }
  } catch {
    // Fall through to plain host parsing below.
  }

  const plainHost = value.replace(/^[a-z]+:\/\//i, '').split('/')[0];
  if (!plainHost) {
    return null;
  }

  const portSeparator = plainHost.lastIndexOf(':');
  return portSeparator > -1 ? plainHost.slice(0, portSeparator) : plainHost;
};

const normalizeLocalHost = (host: string) => {
  if ((host === 'localhost' || host === '127.0.0.1') && Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return host;
};

const resolveExpoHost = () => {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.linkingUri,
    Constants.experienceUrl,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host) {
      return normalizeLocalHost(host);
    }
  }

  return null;
};

export const API_URL = (() => {
  const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitApiUrl) {
    return trimTrailingSlash(explicitApiUrl);
  }

  const expoHost = resolveExpoHost();
  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_API_PORT}`;
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
})();

export const API_BASE_URL = `${API_URL}/api`;
