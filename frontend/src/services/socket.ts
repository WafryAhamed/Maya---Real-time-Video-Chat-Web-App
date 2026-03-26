// ============================================
// Maya — Real Socket.IO Client Service
// ============================================
// Connects to the real backend Socket.IO server.

import { io, Socket as SocketIOClient } from 'socket.io-client';
import type { TypingUser } from '../types';

// Backend server URL
const BACKEND_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:5000';

type EventCallback = (...args: unknown[]) => void;

/**
 * Socket — Real Socket.IO client wrapper
 */
class Socket {
  private client: SocketIOClient;
  private _connected: boolean = false;

  constructor(url: string) {
    this.client = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      autoConnect: false, // Don't auto-connect, let us call connect()
    });

    // Set up standard event listeners
    this.client.on('connect', () => {
      this._connected = true;
      console.log('[Socket] Connected to backend');
    });

    this.client.on('disconnect', () => {
      this._connected = false;
      console.log('[Socket] Disconnected from backend');
    });

    this.client.on('error', (err: unknown) => {
      console.error('[Socket] Error:', err);
    });

    this.client.on('connect_error', (err: unknown) => {
      console.error('[Socket] Connection error:', err);
    });
  }

  get connected(): boolean {
    return this._connected;
  }

  get id(): string {
    return this.client.id || '';
  }

  /** Register an event listener */
  on(event: string, callback: EventCallback): Socket {
    this.client.on(event, callback);
    return this;
  }

  /** Remove an event listener */
  off(event: string, callback?: EventCallback): Socket {
    if (callback) {
      this.client.off(event, callback);
    } else {
      this.client.off(event);
    }
    return this;
  }

  /** Emit an event to the server */
  emit(event: string, ...args: unknown[]): Socket {
    this.client.emit(event, ...args);
    return this;
  }

  /** Connect to server */
  connect(): Socket {
    if (!this._connected) {
      this.client.connect();
    }
    return this;
  }

  /** Disconnect from server */
  disconnect(): Socket {
    this.client.disconnect();
    this._connected = false;
    return this;
  }

  /** Clean up all listeners */
  removeAllListeners(): void {
    this.client.removeAllListeners();
  }
}

/** Singleton socket instance */
let socketInstance: Socket | null = null;

/** Get or create the socket instance */
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = new Socket(BACKEND_URL);
  }
  return socketInstance;
}

/** Create a fresh socket connection */
export function createSocket(): Socket {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance.removeAllListeners();
  }
  socketInstance = new Socket(BACKEND_URL);
  return socketInstance;
}

export type { Socket };