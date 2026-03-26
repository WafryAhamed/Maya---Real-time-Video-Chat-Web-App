import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  memo,
  Component } from
'react';
// ============================================
// Maya — VideoPlayer Component (Enhanced)
// ============================================
// Video tile with connection quality, audio level, pin/fullscreen,
// hand raise indicator, and enhanced overlays.
import {
  Mic,
  MicOff,
  VideoOff,
  Pin,
  Maximize2,
  Minimize2,
  Hand,
  Wifi,
  WifiOff,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh } from
'lucide-react';
import { Avatar, AvatarFallback } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';
import type { ConnectionQuality } from '../types';
interface VideoPlayerProps {
  stream: MediaStream | null;
  userName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isLocal?: boolean;
  isActive?: boolean;
  isPinned?: boolean;
  isHandRaised?: boolean;
  connectionQuality?: ConnectionQuality;
  audioLevel?: number;
  onPin?: () => void;
  onFullscreen?: () => void;
}
/** Get initials from a name */
function getInitials(name: string): string {
  return name.
  split(' ').
  map((n) => n[0]).
  join('').
  toUpperCase().
  slice(0, 2);
}
/** Get connection quality icon and color */
function getConnectionInfo(quality: ConnectionQuality): {
  icon: React.ReactNode;
  color: string;
  label: string;
} {
  switch (quality) {
    case 'excellent':
      return {
        icon: <SignalHigh className="h-3 w-3" />,
        color: 'text-green-400',
        label: 'Excellent'
      };
    case 'good':
      return {
        icon: <SignalMedium className="h-3 w-3" />,
        color: 'text-green-300',
        label: 'Good'
      };
    case 'fair':
      return {
        icon: <SignalLow className="h-3 w-3" />,
        color: 'text-yellow-400',
        label: 'Fair'
      };
    case 'poor':
      return {
        icon: <WifiOff className="h-3 w-3" />,
        color: 'text-red-400',
        label: 'Poor'
      };
  }
}
export const VideoPlayer = memo(function VideoPlayer({
  stream,
  userName,
  isMuted,
  isCameraOff,
  isLocal = false,
  isActive = false,
  isPinned = false,
  isHandRaised = false,
  connectionQuality = 'good',
  audioLevel = 0,
  onPin,
  onFullscreen
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
    onFullscreen?.();
  }, [isFullscreen, onFullscreen]);
  // Listen for fullscreen changes
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);
  const connInfo = getConnectionInfo(connectionQuality);
  // Audio level bar width (clamped 0-100)
  const levelWidth = Math.min(100, Math.max(0, audioLevel));
  return (
    <div
      ref={containerRef}
      className={`
        relative overflow-hidden rounded-xl bg-maya-dark/80
        maya-video-transition group h-full
        ${isActive ? 'maya-glow' : 'border-2 border-maya-dark/40 hover:border-maya-primary/50'}
        ${isPinned ? 'ring-2 ring-yellow-400/60' : ''}
        ${isLocal ? 'ring-1 ring-maya-primary/30' : ''}
      `}
      role="region"
      aria-label={`${userName}'s video${isLocal ? ' (You)' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      
      {/* Video element */}
      {stream && !isCameraOff ?
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`} />
      /* Camera off — avatar placeholder */ :

      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-maya-dark to-[#0a2e47] min-h-[120px]">
          <Avatar size="lg">
            <AvatarFallback className="bg-maya-primary/20 text-maya-primary text-2xl font-heading">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </div>
      }

      {/* Hand raised indicator */}
      {isHandRaised &&
      <div className="absolute top-2 right-2 z-10 animate-bounce">
          <div className="bg-yellow-400 text-yellow-900 rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
            <Hand className="h-4 w-4" />
          </div>
        </div>
      }

      {/* Connection quality indicator (top-left) */}
      {!isLocal &&
      <div className="absolute top-2 left-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
              className={`flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 ${connInfo.color}`}>
              
                {connInfo.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Connection: {connInfo.label}
            </TooltipContent>
          </Tooltip>
        </div>
      }

      {/* Active speaker badge */}
      {isActive &&
      <div className="absolute top-2 left-10 z-10">
          <Badge className="bg-maya-primary/90 text-white text-[10px] px-2 py-0.5 border-0">
            Speaking
          </Badge>
        </div>
      }

      {/* Pinned indicator */}
      {isPinned &&
      <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-yellow-400/90 text-yellow-900 text-[10px] px-2 py-0.5 border-0">
            <Pin className="h-2.5 w-2.5 mr-0.5" />
            Pinned
          </Badge>
        </div>
      }

      {/* Hover action buttons */}
      {isHovered && !isLocal &&
      <div className="absolute top-2 right-2 z-10 flex gap-1 transition-opacity duration-200">
          {onPin &&
        <Button
          size="icon-xs"
          variant="ghost"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          aria-label={isPinned ? 'Unpin video' : 'Pin video'}>
          
              <Pin className={`h-3 w-3 ${isPinned ? 'text-yellow-400' : ''}`} />
            </Button>
        }
          <Button
          size="icon-xs"
          variant="ghost"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            handleFullscreen();
          }}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          
            {isFullscreen ?
          <Minimize2 className="h-3 w-3" /> :

          <Maximize2 className="h-3 w-3" />
          }
          </Button>
        </div>
      }

      {/* Bottom overlay — user name and status */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        {/* Audio level bar */}
        {!isMuted && audioLevel > 5 &&
        <div className="absolute bottom-full left-0 right-0 h-0.5 bg-transparent mb-0">
            <div
            className="h-full bg-green-400 transition-all duration-300 rounded-full"
            style={{
              width: `${levelWidth}%`
            }} />
          
          </div>
        }

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate max-w-[150px]">
              {userName}
              {isLocal &&
              <span className="text-maya-primary ml-1 text-xs">(You)</span>
              }
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isMuted ?
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500/80">
                <MicOff className="h-3 w-3 text-white" />
              </div> :

            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-green-500/20">
                <Mic className="h-3 w-3 text-green-400" />
              </div>
            }

            {isCameraOff &&
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500/80">
                <VideoOff className="h-3 w-3 text-white" />
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

});