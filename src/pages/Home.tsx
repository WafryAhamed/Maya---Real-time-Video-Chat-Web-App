import React, { useCallback, useState } from 'react';
// ============================================
// Maya — Home Page
// ============================================
// Landing page with room creation and joining.

import {
  Video,
  Users,
  ArrowRight,
  Plus,
  Shield,
  Zap,
  Globe } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle } from
'../components/ui/Card';
import { Badge } from '../components/ui/Badge';
interface HomeProps {
  onJoinRoom: (roomId: string) => void;
}
/** Generate a random room ID */
function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segments = [3, 4, 3];
  return segments.
  map((len) =>
  Array.from(
    {
      length: len
    },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  ).
  join('-');
}
export function Home({ onJoinRoom }: HomeProps) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const handleJoinRoom = useCallback(() => {
    const trimmed = roomId.trim();
    if (!trimmed) {
      setError('Please enter a room ID');
      return;
    }
    if (trimmed.length < 3) {
      setError('Room ID must be at least 3 characters');
      return;
    }
    setError('');
    onJoinRoom(trimmed);
  }, [roomId, onJoinRoom]);
  const handleCreateRoom = useCallback(() => {
    const newRoomId = generateRoomId();
    onJoinRoom(newRoomId);
  }, [onJoinRoom]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleJoinRoom();
      }
    },
    [handleJoinRoom]
  );
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-maya-dark via-[#0d4a72] to-maya-dark flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-maya-primary flex items-center justify-center">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-heading text-xl font-semibold tracking-tight">
            Maya
          </span>
        </div>
        <Badge className="bg-maya-primary/20 text-maya-primary border-maya-primary/30 text-xs">
          Beta
        </Badge>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left — Hero text */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
              Connect Sri Lanka
              <br />
              <span className="text-maya-primary">teams together</span>
            </h1>
            <p className="mt-4 text-maya-accent/70 text-lg max-w-md mx-auto lg:mx-0">
              Reliable video meetings linking Colombo to Jaffna, across all of Sri Lanka. No downloads,
              no sign-ups — just click and connect.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <Shield className="h-4 w-4 text-maya-primary" />
                <span className="text-white/80 text-sm">
                  End-to-end encrypted
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <Zap className="h-4 w-4 text-maya-primary" />
                <span className="text-white/80 text-sm">Low latency</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <Globe className="h-4 w-4 text-maya-primary" />
                <span className="text-white/80 text-sm">Works across Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Right — Join/Create card */}
          <Card className="bg-maya-light border-0 shadow-2xl shadow-black/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-maya-dark font-heading text-2xl">
                Start Meeting
              </CardTitle>
              <CardDescription className="text-maya-text">
                Create room or connect to colleagues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Create room */}
              <Button
                className="w-full bg-maya-primary hover:bg-maya-primary/90 text-white h-12 text-base font-medium rounded-xl border-0"
                onClick={handleCreateRoom}>
                
                <Plus className="h-5 w-5 mr-2" />
                Create New Room
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-maya-text/20" />
                <span className="text-maya-text text-sm">or join existing</span>
                <div className="flex-1 h-px bg-maya-text/20" />
              </div>

              {/* Join room */}
              <div className="space-y-3">
                <Input
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter room ID (e.g. abc-defg-hij)"
                  className={`h-12 bg-white border-maya-text/20 text-maya-dark placeholder:text-maya-text/50 rounded-xl text-base ${error ? 'border-maya-danger ring-1 ring-maya-danger/20' : ''}`}
                  aria-label="Room ID"
                  aria-invalid={!!error} />
                
                {error &&
                <p className="text-maya-danger text-sm" role="alert">
                    {error}
                  </p>
                }
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium rounded-xl border-maya-primary/30 text-maya-primary hover:bg-maya-primary/5"
                  onClick={handleJoinRoom}>
                  
                  <Users className="h-5 w-5 mr-2" />
                  Join Room
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-4">
        <p className="text-maya-accent/30 text-xs">
          Maya — Built for Sri Lanka · Secure video conferencing
        </p>
      </footer>
    </main>);

}