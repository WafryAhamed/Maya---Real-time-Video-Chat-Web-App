// ============================================
// Maya — Mock Socket.IO Service
// ============================================
// Minimal Mock Socket.IO-like client for development.

import type { TypingUser } from '../types';

type EventCallback = (...args: unknown[]) => void;

/** Generate a random ID */
function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

/**
 * MockSocket — Simulates Socket.IO client behavior for development.
 */
class MockSocket {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private _connected: boolean = false;
  private _id: string = generateId();

  get connected(): boolean {
    return this._connected;
  }

  get id(): string {
    return this._id;
  }

  /** Register an event listener */
  on(event: string, callback: EventCallback): MockSocket {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  /** Remove an event listener */
  off(event: string, callback?: EventCallback): MockSocket {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  /** Emit an event (triggers local listeners) */
  emit(event: string, ...args: unknown[]): MockSocket {
    setTimeout(() => {
      this.triggerEvent(event, ...args);
    }, 50);
    return this;
  }

  /** Connect to mock server */
  connect(): MockSocket {
    setTimeout(() => {
      this._connected = true;
      this.triggerEvent('connect');
    }, 100);
    return this;
  }

  /** Disconnect from mock server */
  disconnect(): MockSocket {
    this._connected = false;
    this.triggerEvent('disconnect');
    return this;
  }

  /** Trigger event on all registered listeners */
  private triggerEvent(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`[MockSocket] Error in ${event} handler:`, err);
        }
      });
    }
  }

  /** Clean up all listeners */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/** Singleton mock socket instance */
let socketInstance: MockSocket | null = null;

/** Get or create the mock socket instance */
export function getSocket(): MockSocket {
  if (!socketInstance) {
    socketInstance = new MockSocket();
  }
  return socketInstance;
}

/** Create a fresh socket connection */
export function createSocket(): MockSocket {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance.removeAllListeners();
  }
  socketInstance = new MockSocket();
  return socketInstance;
}

export type { MockSocket };