import React, { useCallback, useEffect, useMemo, useState } from 'react';
// ============================================
// Maya — Room Page (Enhanced with AI, Reactions, Polls)
// ============================================
import {
  Video,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Share2,
  Clock } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TooltipProvider } from '../components/ui/Tooltip';
import { VideoGrid } from '../components/VideoGrid';
import { Controls } from '../components/Controls';
import { Sidebar } from '../components/Sidebar';
import { SettingsDialog } from '../components/SettingsDialog';
import { InviteDialog } from '../components/InviteDialog';
import { MeetingReactions } from '../components/MeetingReactions';
import { QuickPoll, CreatePollDialog } from '../components/QuickPoll';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSocket } from '../hooks/useSocket';
import { useActiveSpeaker } from '../hooks/useActiveSpeaker';
import { useSettings } from '../hooks/useSettings';
import { useAIAssistant } from '../hooks/useAIAssistant';
import type {
  ChatItem,
  ChatMessage,
  MeetingReaction,
  Participant,
  PollOption,
  QuickPoll as QuickPollType,
  SystemMessage,
  TypingUser } from
'../types';
interface RoomProps {
  roomId: string;
  onLeave: () => void;
}
function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}
function useElapsedTime(): string {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
export function Room({ roomId, onLeave }: RoomProps) {
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants' | 'ai'>(
    'chat'
  );
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [copied, setCopied] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userName] = useState('You');
  const [userId] = useState(() => generateId());
  // Reactions state
  const [reactions, setReactions] = useState<MeetingReaction[]>([]);
  // Poll state
  const [activePoll, setActivePoll] = useState<QuickPollType | null>(null);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const elapsed = useElapsedTime();
  // Hooks
  const {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    error: mediaError,
    isInitializing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    initializeMedia,
    cleanup
  } = useWebRTC();
  const { emit, on, isConnected } = useSocket();
  const { activeSpeakerId, audioLevels } = useActiveSpeaker(remoteStreams);
  const { preferences, updatePreference, resetPreferences } = useSettings();
  const {
    messages: aiMessages,
    isTyping: aiIsTyping,
    sendMessage: sendAIMessage,
    clearHistory: clearAIHistory
  } = useAIAssistant();
  // Build participants list
  const participants: Participant[] = useMemo(() => {
    const localParticipant: Participant = {
      id: userId,
      name: userName,
      isMuted,
      isCameraOff,
      isScreenSharing,
      role: 'host',
      connectionQuality: 'excellent',
      audioLevel: 0,
      isHandRaised,
      isPinned: false,
      joinedAt: Date.now()
    };
    return [localParticipant, ...remoteStreams.map((p) => p.user)];
  }, [
  userId,
  userName,
  isMuted,
  isCameraOff,
  isScreenSharing,
  isHandRaised,
  remoteStreams]
  );
  // Initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      initializeMedia();
    }, 1200);
    return () => clearTimeout(timer);
  }, [initializeMedia]);
  // Join room via socket
  useEffect(() => {
    if (isConnected && !isLoading) {
      emit('join-room', {
        roomId,
        user: {
          id: userId,
          name: userName,
          isMuted: false,
          isCameraOff: false,
          isScreenSharing: false
        }
      });
    }
  }, [isConnected, isLoading, roomId, userId, userName, emit]);
  // Socket event listeners
  useEffect(() => {
    const handleChatMessage = (data: unknown) => {
      const msg = data as ChatMessage;
      setMessages((prev) => [...prev, msg]);
      if (!sidebarOpen || sidebarTab !== 'chat') {
        setUnreadMessages((prev) => prev + 1);
      }
    };
    const handleSystemMessage = (data: unknown) => {
      const msg = data as SystemMessage;
      setMessages((prev) => [...prev, msg]);
    };
    const handleTypingStart = (data: unknown) => {
      const user = data as TypingUser;
      setTypingUsers((prev) =>
      prev.some((t) => t.userId === user.userId) ? prev : [...prev, user]
      );
    };
    const handleTypingStop = (data: unknown) => {
      const { userId: uid } = data as {
        userId: string;
      };
      setTypingUsers((prev) => prev.filter((t) => t.userId !== uid));
    };
    on('chat-message', handleChatMessage);
    on('system-message', handleSystemMessage);
    on('typing-start', handleTypingStart);
    on('typing-stop', handleTypingStop);
  }, [on, sidebarOpen, sidebarTab]);
  // Clear unread when opening chat tab
  useEffect(() => {
    if (sidebarOpen && sidebarTab === 'chat') setUnreadMessages(0);
  }, [sidebarOpen, sidebarTab]);
  // Clean up old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions((prev) =>
      prev.filter((r) => Date.now() - r.timestamp < 5000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  // Send chat message
  const handleSendMessage = useCallback(
    (content: string) => {
      const message: ChatMessage = {
        id: generateId(),
        userId,
        userName,
        content,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, message]);
      emit('chat-message', { content });
    },
    [userId, userName, emit]
  );
  // Leave call
  const handleLeave = useCallback(() => {
    cleanup();
    emit('leave-room', {
      roomId,
      userId
    });
    onLeave();
  }, [cleanup, emit, roomId, userId, onLeave]);
  // Copy room ID
  const handleCopyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {

      /* fallback */}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);
  // Toggle hand raise
  const handleToggleHand = useCallback(() => {
    setIsHandRaised((prev) => !prev);
    emit('hand-raise', {
      userId,
      isHandRaised: !isHandRaised
    });
  }, [userId, isHandRaised, emit]);
  // Sidebar tab handlers
  const handleToggleChat = useCallback(() => {
    if (sidebarOpen && sidebarTab === 'chat') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setSidebarTab('chat');
      setUnreadMessages(0);
    }
  }, [sidebarOpen, sidebarTab]);
  const handleOpenParticipants = useCallback(() => {
    if (sidebarOpen && sidebarTab === 'participants') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setSidebarTab('participants');
    }
  }, [sidebarOpen, sidebarTab]);
  const handleOpenAI = useCallback(() => {
    if (sidebarOpen && sidebarTab === 'ai') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setSidebarTab('ai');
    }
  }, [sidebarOpen, sidebarTab]);
  // Reactions
  const handleReaction = useCallback(
    (emoji: string) => {
      setReactions((prev) => [
      ...prev,
      {
        id: generateId(),
        emoji,
        userId,
        userName,
        timestamp: Date.now(),
        x: 10 + Math.random() * 80
      }]
      );
    },
    [userId, userName]
  );
  // Polls
  const handleCreatePoll = useCallback(
    (question: string, options: string[]) => {
      const poll: QuickPollType = {
        id: generateId(),
        question,
        options: options.map((text) => ({
          id: generateId(),
          text,
          votes: []
        })),
        createdBy: userId,
        createdAt: Date.now(),
        isActive: true,
        totalVotes: 0
      };
      setActivePoll(poll);
    },
    [userId]
  );
  const handleVote = useCallback(
    (pollId: string, optionId: string) => {
      setActivePoll((prev) => {
        if (!prev || prev.id !== pollId) return prev;
        const alreadyVoted = prev.options.some((o) => o.votes.includes(userId));
        if (alreadyVoted) return prev;
        return {
          ...prev,
          options: prev.options.map((o) =>
          o.id === optionId ?
          {
            ...o,
            votes: [...o.votes, userId]
          } :
          o
          ),
          totalVotes: prev.totalVotes + 1
        };
      });
    },
    [userId]
  );
  const handleClosePoll = useCallback(() => {
    setActivePoll((prev) =>
    prev ?
    {
      ...prev,
      isActive: false
    } :
    null
    );
  }, []);
  const handlePinUser = useCallback((_uid: string) => {}, []);
  const participantCount = useMemo(
    () => 1 + remoteStreams.length,
    [remoteStreams.length]
  );
  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-maya-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-maya-primary/20 flex items-center justify-center">
            <Video className="h-8 w-8 text-maya-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-white font-heading text-xl font-semibold">
              Joining Room
            </h2>
            <p className="text-maya-accent/50 text-sm mt-1">
              Setting up your connection...
            </p>
          </div>
          <Loader2 className="h-6 w-6 text-maya-primary animate-spin mt-2" />
        </div>
      </div>);

  }
  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen w-full flex flex-col bg-maya-dark overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 bg-maya-dark/95 border-b border-maya-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-maya-primary flex items-center justify-center">
              <Video className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-heading font-semibold text-sm hidden sm:block">
              Maya
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-maya-primary/30 text-maya-accent text-xs font-mono cursor-pointer hover:bg-maya-primary/10 transition-colors"
              onClick={handleCopyRoomId}>
              
              {roomId}
              {copied ?
              <Check className="h-3 w-3 ml-1.5 text-green-400" /> :

              <Copy className="h-3 w-3 ml-1.5 opacity-50" />
              }
            </Badge>
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 maya-pulse' : 'bg-maya-danger'}`} />
              
              <span className="text-xs text-maya-accent/50 hidden md:block">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-maya-accent/40">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-mono">{elapsed}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-maya-primary/20 text-maya-primary border-0 text-xs">
              {participantCount} in call
            </Badge>
            <Button
              size="sm"
              className="bg-maya-primary/20 hover:bg-maya-primary/30 text-maya-primary border-0 hidden sm:flex gap-1.5 text-xs"
              onClick={() => setInviteOpen(true)}>
              
              <Share2 className="h-3.5 w-3.5" />
              Invite
            </Button>
          </div>
        </header>

        {/* Media error banner */}
        {mediaError &&
        <div className="flex items-center gap-3 px-4 py-2.5 bg-maya-danger/10 border-b border-maya-danger/20">
            <AlertTriangle className="h-4 w-4 text-maya-danger shrink-0" />
            <p className="text-maya-danger text-sm flex-1">
              {mediaError.message}
            </p>
            <Button
            size="sm"
            variant="outline"
            className="border-maya-danger/30 text-maya-danger hover:bg-maya-danger/10 text-xs shrink-0"
            onClick={initializeMedia}>
            
              Retry
            </Button>
          </div>
        }

        {isInitializing &&
        <div className="flex items-center justify-center gap-2 py-2 bg-maya-primary/10 border-b border-maya-primary/20">
            <Loader2 className="h-4 w-4 text-maya-primary animate-spin" />
            <span className="text-maya-primary text-sm">
              Initializing camera and microphone...
            </span>
          </div>
        }

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden relative">
          <div
            className={`flex-1 flex flex-col transition-all duration-300 relative ${sidebarOpen ? 'sm:mr-[380px]' : ''}`}>
            
            <VideoGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              localUserName={userName}
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              activeSpeakerId={activeSpeakerId}
              audioLevels={audioLevels}
              layoutMode={preferences.layoutMode} />
            

            {/* Floating reactions overlay */}
            <MeetingReactions reactions={reactions} />

            {/* Active poll overlay */}
            {activePoll && activePoll.isActive &&
            <QuickPoll
              poll={activePoll}
              currentUserId={userId}
              onCreatePoll={handleCreatePoll}
              onVote={handleVote}
              onClosePoll={handleClosePoll} />

            }
          </div>

          <Sidebar
            isOpen={sidebarOpen}
            activeTab={sidebarTab}
            messages={messages}
            participants={participants}
            typingUsers={typingUsers}
            currentUserId={userId}
            activeSpeakerId={activeSpeakerId}
            unreadMessages={unreadMessages}
            aiMessages={aiMessages}
            aiIsTyping={aiIsTyping}
            onClose={() => setSidebarOpen(false)}
            onSendMessage={handleSendMessage}
            onTabChange={setSidebarTab}
            onPinUser={handlePinUser}
            onSendAIMessage={sendAIMessage}
            onClearAIHistory={clearAIHistory} />
          
        </div>

        {/* Controls bar */}
        <Controls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isChatOpen={sidebarOpen && sidebarTab === 'chat'}
          isHandRaised={isHandRaised}
          isScreenSharing={isScreenSharing}
          participantCount={participantCount}
          unreadMessages={unreadMessages}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleChat={handleToggleChat}
          onToggleHand={handleToggleHand}
          onToggleScreenShare={toggleScreenShare}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenParticipants={handleOpenParticipants}
          onOpenAI={handleOpenAI}
          onLeaveCall={handleLeave}
          onReaction={handleReaction}
          onOpenPoll={() => setPollDialogOpen(true)} />
        

        {/* Dialogs */}
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          preferences={preferences}
          onUpdatePreference={updatePreference}
          onReset={resetPreferences} />
        
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          roomId={roomId} />
        
        <CreatePollDialog
          open={pollDialogOpen}
          onOpenChange={setPollDialogOpen}
          onCreatePoll={handleCreatePoll} />
        
      </div>
    </TooltipProvider>);

}