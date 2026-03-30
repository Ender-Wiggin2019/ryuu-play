import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import type { ApiConfig, ApiError, UserInfo } from '@/lib/api-types';
import { env, storageKeys } from '@/lib/env';

type AuthState = {
  loading: boolean;
  token: string;
  apiUrl: string;
  config: ApiConfig | null;
  user: UserInfo | null;
};

type LoginPayload = {
  token: string;
  config: ApiConfig;
};

type AuthContextValue = AuthState & {
  isLoggedIn: boolean;
  login: (name: string, password: string, remember: boolean) => Promise<void>;
  refreshTokenLogin: (token: string, remember: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, serverPassword?: string) => Promise<void>;
  setApiUrl: (apiUrl: string, remember: boolean) => Promise<void>;
  logout: () => void;
  sendResetPasswordMail: (email: string) => Promise<void>;
  setNewPassword: (token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<UserInfo> {
  const response = await apiClient.get<{ user: UserInfo }>('/v1/profile/me');
  return response.user;
}

function normalizeApiUrl(value: string): string {
  return value.trim().replace(/\/$/, '');
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState>(() => {
    const storedApiUrl = window.localStorage.getItem(storageKeys.apiUrl);
    const storedToken = window.localStorage.getItem(storageKeys.token);
    const apiUrl = storedApiUrl ? normalizeApiUrl(storedApiUrl) : env.apiUrl;

    apiClient.setApiUrl(apiUrl);
    apiClient.setToken(storedToken || '');

    return {
      loading: true,
      token: storedToken || '',
      apiUrl,
      config: null,
      user: null
    };
  });

  useEffect(() => {
    const bootstrap = async () => {
      if (!state.token) {
        setState(current => ({ ...current, loading: false }));
        return;
      }

      try {
        await refreshTokenLogin(state.token, true);
      } catch {
        setState(current => ({ ...current, loading: false, token: '', user: null, config: null }));
        apiClient.setToken('');
        window.localStorage.removeItem(storageKeys.token);
      }
    };

    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyLoginPayload = async (payload: LoginPayload, remember: boolean) => {
    if (payload.config.apiVersion > env.apiVersion) {
      throw new Error('Unsupported server API version.');
    }

    apiClient.setToken(payload.token);
    const user = await fetchMe();

    if (remember) {
      window.localStorage.setItem(storageKeys.token, payload.token);
    } else {
      window.localStorage.removeItem(storageKeys.token);
    }

    setState(current => ({
      ...current,
      token: payload.token,
      config: payload.config,
      user,
      loading: false
    }));
  };

  const login = async (name: string, password: string, remember: boolean) => {
    setState(current => ({ ...current, loading: true }));
    const payload = await apiClient.post<LoginPayload>('/v1/login', { name, password });
    await applyLoginPayload(payload, remember);
  };

  const refreshTokenLogin = async (token: string, remember: boolean) => {
    apiClient.setToken(token);
    setState(current => ({ ...current, loading: true }));
    const payload = await apiClient.get<LoginPayload>('/v1/login/refreshToken');
    await applyLoginPayload(payload, remember);
  };

  const register = async (name: string, email: string, password: string, serverPassword?: string) => {
    await apiClient.post('/v1/login/register', { name, email, password, serverPassword });
  };

  const setApiUrl = async (apiUrl: string, remember: boolean) => {
    const normalized = normalizeApiUrl(apiUrl);
    const infoResponse = await fetch(`${normalized}/v1/login/info`);
    const info = await infoResponse.json() as { config: ApiConfig; error?: string | number };
    if (!infoResponse.ok || info.error !== undefined) {
      throw new Error('Unable to connect to server.');
    }
    if (info.config.apiVersion > env.apiVersion) {
      throw new Error('Unsupported server API version.');
    }

    apiClient.setApiUrl(normalized);
    if (remember) {
      window.localStorage.setItem(storageKeys.apiUrl, normalized);
    } else {
      window.localStorage.removeItem(storageKeys.apiUrl);
    }

    setState(current => ({ ...current, apiUrl: normalized }));
  };

  const logout = () => {
    apiClient.setToken('');
    setState(current => ({
      ...current,
      token: '',
      user: null,
      config: null
    }));
    window.localStorage.removeItem(storageKeys.token);
  };

  const sendResetPasswordMail = async (email: string) => {
    await apiClient.post('/v1/resetPassword/sendMail', { email });
  };

  const setNewPassword = async (token: string, newPassword: string) => {
    await apiClient.post('/v1/resetPassword/changePassword', { token, newPassword });
  };

  const contextValue = useMemo<AuthContextValue>(() => ({
    ...state,
    isLoggedIn: Boolean(state.user && state.token),
    login,
    refreshTokenLogin,
    register,
    setApiUrl,
    logout,
    sendResetPasswordMail,
    setNewPassword
  }), [state]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return value;
}

export function readApiErrorCode(error: unknown): string | number | undefined {
  return (error as ApiError | undefined)?.code;
}
