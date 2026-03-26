// ============================================
// Maya — useWebRTC Hook (Enhanced)
// ============================================
// Handles local media stream, peer connections, and
// mocked remote streams with Participant type support.

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppError,
  ConnectionQuality,
  MediaErrorType,
  Participant,
  PeerStream } from
'../types';
import {
  MEDIA_CONSTRAINTS,
  MOCK_USER_NAMES,
  SIGNAL_QUALITIES } from
'../utils/constants';

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseMediaError(error: unknown): MediaErrorType {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return 'permission-denied';
      case 'NotFoundError':
        return 'no-device';
      case 'NotReadableError':
        return 'not-readable';
      case 'OverconstrainedError':
        return 'overconstrained';
      default:
        return 'unknown';
    }
  }
  return 'unknown';
}

function getMediaErrorMessage(type: MediaErrorType): string {
  switch (type) {
    case 'permission-denied':
      return 'Camera/microphone access denied. Please allow permissions in your browser settings.';
    case 'no-device':
      return 'No camera or microphone found. Please connect a device.';
    case 'not-readable':
      return 'Camera or microphone is already in use by another application.';
    case 'overconstrained':
      return 'Camera does not support the requested resolution.';
    default:
      return 'An unexpected error occurred while accessing media devices.';
  }
}

function createMockParticipant(
name: string,
role: 'host' | 'participant')
: Participant {
  return {
    id: generateId(),
    name,
    isMuted: Math.random() > 0.5,
    isCameraOff: Math.random() > 0.6,
    isScreenSharing: false,
    role,
    connectionQuality: randomPick(['excellent', 'good', 'good'] as const),
    audioLevel: 0,
    isHandRaised: false,
    isPinned: false,
    joinedAt: Date.now()
  };
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: PeerStream[];
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  error: AppError | null;
  isInitializing: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  initializeMedia: () => Promise<void>;
  cleanup: () => void;
}

export function useWebRTC(roomId: string | undefined): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<PeerStream[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mockTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mockIntervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const initializeMedia = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const stream =
      await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsInitializing(false);
      if (roomId) simulateRemotePeers();
    } catch (err) {
      const errorType = parseMediaError(err);
      setError({
        type: 'media',
        message: getMediaErrorMessage(errorType),
        details: errorType
      });
      setIsInitializing(false);
      if (roomId) simulateRemotePeers();
    }
  }, [roomId]);

  const simulateRemotePeers = useCallback(() => {
    const mockPeers: PeerStream[] = MOCK_USER_NAMES.slice(0, 3).map(
      (name, i) => ({
        peerId: generateId(),
        stream: null,
        user: createMockParticipant(name, i === 0 ? 'host' : 'participant')
      })
    );

    // Stagger arrivals
    mockPeers.forEach((peer, index) => {
      const timer = setTimeout(
        () => {
          setRemoteStreams((prev) => {
            if (prev.some((p) => p.peerId === peer.peerId)) return prev;
            return [...prev, peer];
          });
        },
        800 + index * 1200
      );
      mockTimersRef.current.push(timer);
    });

    // Simulate dynamic events
    // User leaves after 20s
    const leaveTimer = setTimeout(() => {
      setRemoteStreams((prev) => prev.length > 2 ? prev.slice(0, -1) : prev);
    }, 20000);
    mockTimersRef.current.push(leaveTimer);

    // New user joins after 8s
    const joinTimer = setTimeout(() => {
      const newPeer: PeerStream = {
        peerId: generateId(),
        stream: null,
        user: createMockParticipant(MOCK_USER_NAMES[4], 'participant')
      };
      setRemoteStreams((prev) => [...prev, newPeer]);
    }, 8000);
    mockTimersRef.current.push(joinTimer);

    // Periodic mute/camera toggles
    const toggleInterval = setInterval(() => {
      setRemoteStreams((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((p, i) => {
          if (i !== idx) return p;
          const toggle = Math.random() > 0.5 ? 'isMuted' : 'isCameraOff';
          return { ...p, user: { ...p.user, [toggle]: !p.user[toggle] } };
        });
      });
    }, 9000);
    mockIntervalsRef.current.push(toggleInterval);

    // Connection quality changes
    const connInterval = setInterval(() => {
      setRemoteStreams((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((p, i) =>
        i === idx ?
        {
          ...p,
          user: {
            ...p.user,
            connectionQuality: randomPick(SIGNAL_QUALITIES)
          }
        } :
        p
        );
      });
    }, 12000);
    mockIntervalsRef.current.push(connInterval);

    // Hand raise simulation
    const handTimer = setTimeout(() => {
      setRemoteStreams((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((p, i) =>
        i === idx ? { ...p, user: { ...p.user, isHandRaised: true } } : p
        );
      });
      // Lower after 6s
      const lowerTimer = setTimeout(() => {
        setRemoteStreams((prev) =>
        prev.map((p) => ({ ...p, user: { ...p.user, isHandRaised: false } }))
        );
      }, 6000);
      mockTimersRef.current.push(lowerTimer);
    }, 10000);
    mockTimersRef.current.push(handTimer);
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsCameraOff((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing((prev) => !prev);
  }, []);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStreams([]);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
    setError(null);
    mockTimersRef.current.forEach(clearTimeout);
    mockTimersRef.current = [];
    mockIntervalsRef.current.forEach(clearInterval);
    mockIntervalsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    error,
    isInitializing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    initializeMedia,
    cleanup
  };
}