import React, { memo, Component } from 'react';
// ============================================
// Maya — ParticipantList Component (NEW)
// ============================================
// Displays room participants with roles, status, and actions.

import {
  Mic,
  MicOff,
  VideoOff,
  Pin,
  Crown,
  Hand,
  SignalHigh,
  SignalMedium,
  SignalLow,
  WifiOff } from
'lucide-react';
import { Avatar, AvatarFallback } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ScrollArea } from './ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';
import type { ConnectionQuality, Participant } from '../types';
interface ParticipantListProps {
  participants: Participant[];
  localUserId: string;
  activeSpeakerId: string | null;
  onPinUser: (userId: string) => void;
}
function getInitials(name: string): string {
  return name.
  split(' ').
  map((n) => n[0]).
  join('').
  toUpperCase().
  slice(0, 2);
}
function getColorFromName(name: string): string {
  const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500'];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
function ConnectionIcon({ quality }: {quality: ConnectionQuality;}) {
  switch (quality) {
    case 'excellent':
      return <SignalHigh className="h-3 w-3 text-green-400" />;
    case 'good':
      return <SignalMedium className="h-3 w-3 text-green-300" />;
    case 'fair':
      return <SignalLow className="h-3 w-3 text-yellow-400" />;
    case 'poor':
      return <WifiOff className="h-3 w-3 text-red-400" />;
  }
}
export const ParticipantList = memo(function ParticipantList({
  participants,
  localUserId,
  activeSpeakerId,
  onPinUser
}: ParticipantListProps) {
  // Sort: host first, then by name
  const sorted = [...participants].sort((a, b) => {
    if (a.role === 'host' && b.role !== 'host') return -1;
    if (b.role === 'host' && a.role !== 'host') return 1;
    return a.name.localeCompare(b.name);
  });
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        {sorted.map((p) => {
          const isLocal = p.id === localUserId;
          const isSpeaking = p.id === activeSpeakerId;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isSpeaking ? 'bg-maya-primary/10' : 'hover:bg-white/30'}`}>
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar size="sm">
                  <AvatarFallback
                    className={`${getColorFromName(p.name)} text-white text-xs`}>
                    
                    {getInitials(p.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-maya-accent" />
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-maya-dark truncate">
                    {p.name}
                    {isLocal &&
                    <span className="text-maya-primary ml-1 text-xs">
                        (You)
                      </span>
                    }
                  </span>
                  {p.role === 'host' &&
                  <Tooltip>
                      <TooltipTrigger asChild>
                        <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>Host</TooltipContent>
                    </Tooltip>
                  }
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ConnectionIcon quality={p.connectionQuality} />
                  {isSpeaking &&
                  <span className="text-[10px] text-maya-primary font-medium">
                      Speaking
                    </span>
                  }
                </div>
              </div>

              {/* Status icons */}
              <div className="flex items-center gap-1 shrink-0">
                {p.isHandRaised &&
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-yellow-400/20">
                    <Hand className="h-3 w-3 text-yellow-500" />
                  </div>
                }
                {p.isMuted &&
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500/10">
                    <MicOff className="h-3 w-3 text-red-400" />
                  </div>
                }
                {p.isCameraOff &&
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500/10">
                    <VideoOff className="h-3 w-3 text-red-400" />
                  </div>
                }
                {!isLocal &&
                <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                      size="icon-xs"
                      variant="ghost"
                      className="text-maya-text hover:text-maya-primary rounded-full h-6 w-6"
                      onClick={() => onPinUser(p.id)}
                      aria-label={`Pin ${p.name}'s video`}>
                      
                        <Pin className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pin video</TooltipContent>
                  </Tooltip>
                }
              </div>
            </div>);

        })}
      </div>
    </ScrollArea>);

});