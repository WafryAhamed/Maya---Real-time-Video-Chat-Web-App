// ============================================
// Maya Backend — Type Definitions
// ============================================
// Mirrors frontend types for consistency

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

export interface Participant extends User {
  role: 'host' | 'participant';
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  audioLevel: number;
  isHandRaised: boolean;
  isPinned: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export type SystemMessageType = 'join' | 'leave' | 'mute' | 'hand-raise';

export interface SystemMessage {
  id: string;
  type: SystemMessageType;
  userName: string;
  timestamp: number;
}

export type ChatItem = ChatMessage | SystemMessage;

export interface TypingUser {
  userId: string;
  userName: string;
}

export interface Room {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: number;
  messages: ChatMessage[];
  polls: QuickPoll[];
  isActive: boolean;
}

export interface PeerStream {
  peerId: string;
  stream: MediaStream | null;
  user: Participant;
}

export interface SignalOffer {
  from: string;
  to: string;
  offer: RTCSessionDescriptionInit;
}

export interface SignalAnswer {
  from: string;
  to: string;
  answer: RTCSessionDescriptionInit;
}

export interface SignalIceCandidate {
  from: string;
  to: string;
  candidate: RTCIceCandidateInit;
}

export interface SocketEvents {
  'join-room': {
    roomId: string;
    user: User;
  };
  'leave-room': {
    roomId: string;
    userId: string;
  };
  'user-joined': {
    user: Participant;
  };
  'user-left': {
    userId: string;
  };
  offer: SignalOffer;
  answer: SignalAnswer;
  'ice-candidate': SignalIceCandidate;
  'chat-message': ChatMessage;
  'system-message': SystemMessage;
  'toggle-audio': {
    userId: string;
    isMuted: boolean;
  };
  'toggle-video': {
    userId: string;
    isCameraOff: boolean;
  };
  'room-users': {
    users: Participant[];
  };
  'speaking-activity': {
    userId: string;
    audioLevel: number;
  };
  'typing-start': TypingUser;
  'typing-stop': {
    userId: string;
  };
  'hand-raised': {
    userId: string;
    isHandRaised: boolean;
  };
  'connection-quality': {
    userId: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  error: {
    message: string;
  };
}

export interface PierConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface QuickPoll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
  totalVotes: number;
}

export interface MeetingReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
  x: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}
