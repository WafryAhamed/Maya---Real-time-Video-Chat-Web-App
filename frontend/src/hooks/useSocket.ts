// ============================================
// Maya — useSocket Hook
// ============================================

import { useCallback, useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import type { MockSocket } from '../services/socket';

type EventCallback = (...args: unknown[]) => void;

interface UseSocketReturn {
  socket: MockSocket | null;
  isConnected: boolean;
  connectionError: string | null;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: EventCallback) => void;
  off: (event: string, callback?: EventCallback) => void;
}

/**
 * useSocket — Manages socket event listeners with automatic cleanup.
 * Wraps the SocketContext for convenient component-level usage.
 */
export function useSocket(): UseSocketReturn {
  const { socket, isConnected, connectionError } = useSocketContext();
  const listenersRef = useRef<Map<string, Set<EventCallback>>>(new Map());

  /** Emit an event through the socket */
  const emit = useCallback(
    (event: string, data?: unknown) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      } else {
        console.warn('[useSocket] Cannot emit — socket not connected');
      }
    },
    [socket, isConnected]
  );

  /** Register an event listener (tracked for cleanup) */
  const on = useCallback(
    (event: string, callback: EventCallback) => {
      if (!socket) return;

      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }
      listenersRef.current.get(event)!.add(callback);
      socket.on(event, callback);
    },
    [socket]
  );

  /** Remove an event listener */
  const off = useCallback(
    (event: string, callback?: EventCallback) => {
      if (!socket) return;

      if (callback) {
        listenersRef.current.get(event)?.delete(callback);
      } else {
        listenersRef.current.delete(event);
      }
      socket.off(event, callback);
    },
    [socket]
  );

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        listenersRef.current.forEach((callbacks, event) => {
          callbacks.forEach((cb) => socket.off(event, cb));
        });
        listenersRef.current.clear();
      }
    };
  }, [socket]);

  return { socket, isConnected, connectionError, emit, on, off };
}