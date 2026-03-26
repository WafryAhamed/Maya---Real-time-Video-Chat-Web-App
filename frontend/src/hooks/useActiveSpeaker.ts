// ============================================
// Maya — useActiveSpeaker Hook
// ============================================
// Simulates active speaker detection by cycling audio levels.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PeerStream } from '../types';

interface UseActiveSpeakerReturn {
  activeSpeakerId: string | null;
  audioLevels: Map<string, number>;
}

export function useActiveSpeaker(
remoteStreams: PeerStream[])
: UseActiveSpeakerReturn {
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<Map<string, number>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate audio level changes
  const simulateAudioLevels = useCallback(() => {
    if (remoteStreams.length === 0) {
      setActiveSpeakerId(null);
      setAudioLevels(new Map());
      return;
    }

    const newLevels = new Map<string, number>();
    let maxLevel = 0;
    let maxId: string | null = null;

    remoteStreams.forEach((peer) => {
      // Most users are quiet (0-15), occasionally one speaks (40-95)
      const isSpeaking = Math.random() > 0.65;
      const level = isSpeaking ?
      Math.floor(40 + Math.random() * 55) :
      Math.floor(Math.random() * 15);

      newLevels.set(peer.peerId, level);

      if (level > maxLevel) {
        maxLevel = level;
        maxId = peer.peerId;
      }
    });

    setAudioLevels(newLevels);
    // Only set active speaker if someone is actually speaking (level > 30)
    setActiveSpeakerId(maxLevel > 30 ? maxId : null);
  }, [remoteStreams]);

  useEffect(() => {
    // Update audio levels every 2-4 seconds
    intervalRef.current = setInterval(simulateAudioLevels, 2500);
    // Initial simulation
    simulateAudioLevels();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulateAudioLevels]);

  return { activeSpeakerId, audioLevels };
}