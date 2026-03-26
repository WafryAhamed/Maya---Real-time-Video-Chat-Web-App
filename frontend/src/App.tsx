import React, { useCallback, useState } from 'react';
// ============================================
// Maya — App Root
// ============================================
// Simple client-side routing between Home and Room pages.
import { SocketProvider } from './context/SocketContext';
import { Home } from './pages/Home';
import { Room } from './pages/Room';
type AppView = 'home' | 'room';
export function App() {
  const [view, setView] = useState<AppView>('home');
  const [roomId, setRoomId] = useState<string>('');
  const handleJoinRoom = useCallback((id: string) => {
    setRoomId(id);
    setView('room');
  }, []);
  const handleLeaveRoom = useCallback(() => {
    setRoomId('');
    setView('home');
  }, []);
  return (
    <SocketProvider>
      <div className="h-screen w-full overflow-hidden">
        {view === 'home' && <Home onJoinRoom={handleJoinRoom} />}
        {view === 'room' && <Room roomId={roomId} onLeave={handleLeaveRoom} />}
      </div>
    </SocketProvider>);

}