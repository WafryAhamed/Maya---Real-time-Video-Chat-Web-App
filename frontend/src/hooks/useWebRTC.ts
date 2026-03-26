// ============================================
// Maya — useWebRTC Hook (Enhanced)
// ============================================
// Handles local media stream, peer connections, and
// mocked remote streams with Participant type support.

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppError,
  MediaErrorType,
  PeerStream } from
'../types';
import {
  MEDIA_CONSTRAINTS } from
'../utils/constants';

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

export function useWebRTC(): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<PeerStream[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  const initializeMedia = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const stream =
      await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsInitializing(false);
    } catch (err) {
      const errorType = parseMediaError(err);
      setError({
        type: 'media',
        message: getMediaErrorMessage(errorType),
        details: errorType
      });
      setIsInitializing(false);
    }
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