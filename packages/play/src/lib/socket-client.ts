import { io, type Socket } from 'socket.io-client';

type SocketResponse<T> = {
  message: 'ok' | string;
  data?: T;
};

export class SocketClient {
  private socket: Socket | null = null;

  public connect(apiUrl: string, token: string): Socket {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(apiUrl, {
      autoConnect: true,
      reconnection: false,
      query: { token }
    });

    return this.socket;
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  public on<T>(event: string, handler: (data: T) => void): void {
    if (!this.socket) {
      return;
    }
    this.socket.on(event, handler);
  }

  public off(event: string): void {
    this.socket?.off(event);
  }

  public emit<TInput, TOutput>(event: string, data?: TInput): Promise<TOutput> {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(event, data, (response: SocketResponse<TOutput>) => {
        if (!response || response.message !== 'ok') {
          reject(new Error(String(response?.data ?? 'Socket request failed')));
          return;
        }
        resolve(response.data as TOutput);
      });
    });
  }
}
