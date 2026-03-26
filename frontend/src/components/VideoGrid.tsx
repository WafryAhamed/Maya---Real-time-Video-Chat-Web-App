import React, { useCallback, useMemo, useState, memo, Component } from 'react';
// ============================================
// Maya — VideoGrid Component (Enhanced)
// ============================================
// Adaptive grid with spotlight mode, pinned user support,
// and active speaker highlighting.
import type { PeerStream } from '../types';
import { VideoPlayer } from './VideoPlayer';
interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: PeerStream[];
  localUserName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  activeSpeakerId: string | null;
  audioLevels: Map<string, number>;
  layoutMode: 'auto' | 'grid' | 'spotlight';
}
/**
 * Determine grid classes based on participant count and layout mode.
 */
function getGridClasses(
count: number,
layout: string,
hasPinned: boolean)
: string {
  if (layout === 'spotlight' || hasPinned) {
    return 'grid-cols-1';
  }
  if (count <= 1) return 'grid-cols-1 max-w-2xl mx-auto';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
  if (count <= 4) return 'grid-cols-1 md:grid-cols-2';
  if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}
export const VideoGrid = memo(function VideoGrid({
  localStream,
  remoteStreams,
  localUserName,
  isMuted,
  isCameraOff,
  activeSpeakerId,
  audioLevels,
  layoutMode
}: VideoGridProps) {
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);
  const totalParticipants = 1 + remoteStreams.length;
  const hasPinned = pinnedPeerId !== null;
  const gridClasses = useMemo(
    () => getGridClasses(totalParticipants, layoutMode, hasPinned),
    [totalParticipants, layoutMode, hasPinned]
  );
  const handlePin = useCallback((peerId: string) => {
    setPinnedPeerId((prev) => prev === peerId ? null : peerId);
  }, []);
  // Separate pinned stream from others
  const pinnedStream = useMemo(
    () => remoteStreams.find((p) => p.peerId === pinnedPeerId),
    [remoteStreams, pinnedPeerId]
  );
  const unpinnedStreams = useMemo(
    () => remoteStreams.filter((p) => p.peerId !== pinnedPeerId),
    [remoteStreams, pinnedPeerId]
  );
  // Spotlight mode: show active speaker large, others in strip
  const spotlightId =
  layoutMode === 'spotlight' ?
  activeSpeakerId || (remoteStreams[0]?.peerId ?? null) :
  null;
  if (
  hasPinned && pinnedStream ||
  layoutMode === 'spotlight' && remoteStreams.length > 0)
  {
    const mainStream =
    pinnedStream ||
    remoteStreams.find((p) => p.peerId === spotlightId) ||
    remoteStreams[0];
    const sideStreams = remoteStreams.filter(
      (p) => p.peerId !== mainStream.peerId
    );
    return (
      <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden gap-3">
        {/* Main spotlight video */}
        <div className="flex-1 min-h-0">
          <VideoPlayer
            stream={mainStream.stream}
            userName={mainStream.user.name}
            isMuted={mainStream.user.isMuted}
            isCameraOff={mainStream.user.isCameraOff}
            isActive={mainStream.peerId === activeSpeakerId}
            isPinned={mainStream.peerId === pinnedPeerId}
            isHandRaised={mainStream.user.isHandRaised}
            connectionQuality={mainStream.user.connectionQuality}
            audioLevel={audioLevels.get(mainStream.peerId) ?? 0}
            onPin={() => handlePin(mainStream.peerId)} />
          
        </div>

        {/* Bottom strip — local + other remotes */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="w-40 h-24 shrink-0">
            <VideoPlayer
              stream={localStream}
              userName={localUserName}
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              isLocal />
            
          </div>
          {sideStreams.map((peer) =>
          <div key={peer.peerId} className="w-40 h-24 shrink-0">
              <VideoPlayer
              stream={peer.stream}
              userName={peer.user.name}
              isMuted={peer.user.isMuted}
              isCameraOff={peer.user.isCameraOff}
              isActive={peer.peerId === activeSpeakerId}
              isHandRaised={peer.user.isHandRaised}
              connectionQuality={peer.user.connectionQuality}
              audioLevel={audioLevels.get(peer.peerId) ?? 0}
              onPin={() => handlePin(peer.peerId)} />
            
            </div>
          )}
        </div>
      </div>);

  }
  // Standard grid layout
  return (
    <div className="flex-1 p-3 md:p-4 overflow-auto">
      <div className={`grid ${gridClasses} gap-3 md:gap-4 h-full`}>
        {/* Local video tile */}
        <div className="aspect-video">
          <VideoPlayer
            stream={localStream}
            userName={localUserName}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isLocal />
          
        </div>

        {/* Remote video tiles */}
        {remoteStreams.map((peer) =>
        <div key={peer.peerId} className="aspect-video">
            <VideoPlayer
            stream={peer.stream}
            userName={peer.user.name}
            isMuted={peer.user.isMuted}
            isCameraOff={peer.user.isCameraOff}
            isActive={peer.peerId === activeSpeakerId}
            isPinned={peer.peerId === pinnedPeerId}
            isHandRaised={peer.user.isHandRaised}
            connectionQuality={peer.user.connectionQuality}
            audioLevel={audioLevels.get(peer.peerId) ?? 0}
            onPin={() => handlePin(peer.peerId)} />
          
          </div>
        )}
      </div>

      {/* Empty state when alone */}
      {remoteStreams.length === 0 &&
      <div className="flex items-center justify-center mt-8">
          <div className="text-center">
            <p className="text-maya-accent/60 text-sm">
              Waiting for others to join...
            </p>
            <p className="text-maya-text text-xs mt-1">
              Share the room link to invite participants
            </p>
          </div>
        </div>
      }
    </div>);

});