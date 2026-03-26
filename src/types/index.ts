// ============================================
// Maya — Type Definitions (Enhanced)
// ============================================

/** Represents a user in the video chat */
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

/** Participant roles */
export type ParticipantRole = 'host' | 'participant';

/** Connection quality levels */
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

/** System message types */
export type SystemMessageType = 'join' | 'leave' | 'mute' | 'hand-raise';

/** Extended user with meeting-specific state */
export interface Participant extends User {
  role: ParticipantRole;
  connectionQuality: ConnectionQuality;
  audioLevel: number; // 0-100 simulated
  isHandRaised: boolean;
  isPinned: boolean;
  joinedAt: number;
}

/** Represents a chat message */
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

/** System-generated message (join/leave/etc) */
export interface SystemMessage {
  id: string;
  type: SystemMessageType;
  userName: string;
  timestamp: number;
}

/** Union type for chat items */
export type ChatItem = ChatMessage | SystemMessage;

/** Type guard for system messages */
export function isSystemMessage(item: ChatItem): item is SystemMessage {
  return 'type' in item && !('content' in item);
}

/** Typing indicator user */
export interface TypingUser {
  userId: string;
  userName: string;
}

/** User preferences stored in localStorage */
export interface UserPreferences {
  selectedCamera: string;
  selectedMicrophone: string;
  layoutMode: 'auto' | 'grid' | 'spotlight';
  theme: 'dark' | 'light';
}

/** Mock device info */
export interface MockDevice {
  id: string;
  label: string;
}

/** Represents a room */
export interface Room {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: number;
}

/** Media stream with user association */
export interface PeerStream {
  peerId: string;
  stream: MediaStream | null;
  user: Participant;
}

/** WebRTC signaling: offer */
export interface SignalOffer {
  from: string;
  to: string;
  offer: RTCSessionDescriptionInit;
}

/** WebRTC signaling: answer */
export interface SignalAnswer {
  from: string;
  to: string;
  answer: RTCSessionDescriptionInit;
}

/** WebRTC signaling: ICE candidate */
export interface SignalIceCandidate {
  from: string;
  to: string;
  candidate: RTCIceCandidateInit;
}

/** Socket event map for type safety */
export interface SocketEvents {
  'join-room': {roomId: string;user: User;};
  'leave-room': {roomId: string;userId: string;};
  'user-joined': {user: Participant;};
  'user-left': {userId: string;};
  offer: SignalOffer;
  answer: SignalAnswer;
  'ice-candidate': SignalIceCandidate;
  'chat-message': ChatMessage;
  'system-message': SystemMessage;
  'toggle-audio': {userId: string;isMuted: boolean;};
  'toggle-video': {userId: string;isCameraOff: boolean;};
  'room-users': {users: Participant[];};
  'speaking-activity': {userId: string;audioLevel: number;};
  'typing-start': TypingUser;
  'typing-stop': {userId: string;};
  'hand-raised': {userId: string;isHandRaised: boolean;};
  'connection-quality': {userId: string;quality: ConnectionQuality;};
  error: {message: string;};
}

/** Peer connection state */
export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

/** Media device error types */
export type MediaErrorType =
'permission-denied' |
'no-device' |
'not-readable' |
'overconstrained' |
'unknown';

/** App-level error */
export interface AppError {
  type: 'media' | 'socket' | 'webrtc' | 'general';
  message: string;
  details?: string;
}

// ============================================
// AI Assistant Types
// ============================================

/** AI message role */
export type AIMessageRole = 'user' | 'assistant';

/** AI message */
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

/** AI suggested action */
export interface AIActionItem {
  id: string;
  text: string;
  assignee?: string;
  completed: boolean;
}

/** AI meeting summary */
export interface AIMeetingSummary {
  keyPoints: string[];
  actionItems: AIActionItem[];
  mood: 'positive' | 'neutral' | 'focused' | 'energetic';
  participationScore: number; // 0-100
}

/** AI slash command */
export type AISlashCommand =
'/summarize' |
'/actions' |
'/mood' |
'/notes' |
'/help' |
'/translate';

// ============================================
// Meeting Reactions Types
// ============================================

/** Floating reaction */
export interface MeetingReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
  x: number; // horizontal position 0-100%
}

// ============================================
// Quick Poll Types
// ============================================

/** Poll option */
export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs who voted
}

/** Quick poll */
export interface QuickPoll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
  totalVotes: number;
}