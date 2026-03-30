import { env } from '@/lib/env';
import type { ApiEnvelope, ApiError } from '@/lib/api-types';

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeoutMs);

    promise.then(
      value => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export class ApiClient {
  private token = '';
  private apiUrl = env.apiUrl;

  public setToken(token: string): void {
    this.token = token;
  }

  public setApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl;
  }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  public async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  public async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Auth-Token'] = this.token;
    }

    const response = await withTimeout(fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    }), env.timeout);

    const payload = await response.json() as ApiEnvelope & T;
    if (!response.ok || payload.error !== undefined) {
      const error = new Error(payload.message || `API error: ${String(payload.error)}`) as ApiError;
      error.code = payload.error;
      error.status = response.status;
      throw error;
    }

    return payload as T;
  }
}

export const apiClient = new ApiClient();
