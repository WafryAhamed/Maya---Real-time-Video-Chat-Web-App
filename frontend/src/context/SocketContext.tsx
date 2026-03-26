import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext } from
'react';
// ============================================
// Maya — Socket Context Provider
// ============================================

import { createSocket, type Socket } from '../services/socket';
interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connectionError: null
});
interface SocketProviderProps {
  children: React.ReactNode;
}
export function SocketProvider({ children }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  useEffect(() => {
    // Create and connect socket
    const socket = createSocket();
    socketRef.current = socket;
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on('error', (data: unknown) => {
      const errorData = data as {
        message: string;
      };
      setConnectionError(errorData.message);
    });
    // Initiate connection
    socket.connect();
    return () => {
      socket.disconnect();
      socket.removeAllListeners();
      socketRef.current = null;
    };
  }, []);
  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        connectionError
      }}>
      
      {children}
    </SocketContext.Provider>);

}
/** Hook to access socket context */
export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}