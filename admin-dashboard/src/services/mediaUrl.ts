const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getApiOrigin = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() || '/api';

  try {
    return trimTrailingSlash(new URL(configuredApiUrl, window.location.origin).origin);
  } catch {
    return trimTrailingSlash(window.location.origin);
  }
};

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${getApiOrigin()}${normalizedPath}`;
};
