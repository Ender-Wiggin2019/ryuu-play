const defaultApiUrl = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://127.0.0.1:12021';

export const env = {
  apiUrl: defaultApiUrl,
  timeout: 5000,
  apiVersion: 4,
  defaultPageSize: 50,
  allowServerChange: true,
  defaultLanguage: 'zh'
} as const;

export const storageKeys = {
  token: 'token',
  apiUrl: 'apiUrl',
  language: 'language'
} as const;
