import React, { useCallback, useState, memo, Component } from 'react';
// ============================================
// Maya — Controls Component (Enhanced with Reactions & Polls)
// ============================================
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Monitor,
  Users,
  Hand,
  Settings,
  Bot,
  SmilePlus,
  BarChart3 } from
'lucide-react';
import { Button } from './ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
'./ui/Tooltip';
import { Badge } from './ui/Badge';
import { Separator } from './ui/Separator';
import { REACTION_EMOJIS } from '../utils/constants';
interface ControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isChatOpen: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  participantCount: number;
  unreadMessages: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onToggleHand: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
  onOpenParticipants: () => void;
  onOpenAI: () => void;
  onLeaveCall: () => void;
  onReaction: (emoji: string) => void;
  onOpenPoll: () => void;
}
export const Controls = memo(function Controls({
  isMuted,
  isCameraOff,
  isChatOpen,
  isHandRaised,
  isScreenSharing,
  participantCount,
  unreadMessages,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleHand,
  onToggleScreenShare,
  onOpenSettings,
  onOpenParticipants,
  onOpenAI,
  onLeaveCall,
  onReaction,
  onOpenPoll
}: ControlsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const handleReaction = useCallback(
    (emoji: string) => {
      onReaction(emoji);
      setShowReactions(false);
    },
    [onReaction]
  );
  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex items-center justify-center px-4 py-3 bg-maya-dark/95 backdrop-blur-md border-t border-maya-primary/10">
        {/* Reaction picker popup */}
        {showReactions &&
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-maya-primary/10 px-3 py-2 flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {REACTION_EMOJIS.map((emoji) =>
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-maya-accent hover:scale-125 transition-all text-xl"
            aria-label={`React with ${emoji}`}>
            
                {emoji}
              </button>
          )}
          </div>
        }

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Audio toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className={`rounded-full border-0 transition-all duration-200 ${isMuted ? 'bg-maya-danger hover:bg-maya-danger/80 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={onToggleAudio}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
                
                {isMuted ?
                <MicOff className="h-5 w-5" /> :

                <Mic className="h-5 w-5" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isMuted ? 'Unmute' : 'Mute'}
            </TooltipContent>
          </Tooltip>

          {/* Video toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className={`rounded-full border-0 transition-all duration-200 ${isCameraOff ? 'bg-maya-danger hover:bg-maya-danger/80 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={onToggleVideo}
                aria-label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
                
                {isCameraOff ?
                <VideoOff className="h-5 w-5" /> :

                <Video className="h-5 w-5" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isCameraOff ? 'Start Video' : 'Stop Video'}
            </TooltipContent>
          </Tooltip>

          {/* Screen share */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className={`rounded-full border-0 hidden md:flex transition-all duration-200 ${isScreenSharing ? 'bg-maya-primary hover:bg-maya-primary/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={onToggleScreenShare}
                aria-label="Share screen">
                
                <Monitor className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            </TooltipContent>
          </Tooltip>

          <Separator
            orientation="vertical"
            className="h-8 bg-white/10 mx-0.5 hidden md:block" />
          

          {/* Reactions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className={`rounded-full border-0 transition-all duration-200 ${showReactions ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={() => setShowReactions((prev) => !prev)}
                aria-label="Send reaction">
                
                <SmilePlus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Reactions</TooltipContent>
          </Tooltip>

          {/* Raise hand */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className={`rounded-full border-0 transition-all duration-200 ${isHandRaised ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-lg shadow-yellow-400/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={onToggleHand}
                aria-label={isHandRaised ? 'Lower hand' : 'Raise hand'}>
                
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            </TooltipContent>
          </Tooltip>

          {/* Poll */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full border-0 hidden md:flex"
                onClick={onOpenPoll}
                aria-label="Create poll">
                
                <BarChart3 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Quick Poll</TooltipContent>
          </Tooltip>

          <Separator
            orientation="vertical"
            className="h-8 bg-white/10 mx-0.5 hidden md:block" />
          

          {/* Participants */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full border-0 relative"
                onClick={onOpenParticipants}
                aria-label={`${participantCount} participants`}>
                
                <Users className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] bg-maya-primary text-white border-0">
                  {participantCount}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {participantCount} Participants
            </TooltipContent>
          </Tooltip>

          {/* Chat toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className={`rounded-full border-0 relative transition-all duration-200 ${isChatOpen ? 'bg-maya-primary hover:bg-maya-primary/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={onToggleChat}
                aria-label={isChatOpen ? 'Close chat' : 'Open chat'}>
                
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && !isChatOpen &&
                <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] bg-maya-danger text-white border-0 animate-pulse">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </Badge>
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isChatOpen ? 'Close Chat' : 'Open Chat'}
            </TooltipContent>
          </Tooltip>

          {/* AI Assistant */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className="bg-gradient-to-r from-purple-500/20 to-maya-primary/20 hover:from-purple-500/30 hover:to-maya-primary/30 text-purple-300 rounded-full border-0"
                onClick={onOpenAI}
                aria-label="Maya AI Assistant">
                
                <Bot className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Maya AI ✨</TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-lg"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full border-0 hidden md:flex"
                onClick={onOpenSettings}
                aria-label="Settings">
                
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Settings</TooltipContent>
          </Tooltip>

          <Separator
            orientation="vertical"
            className="h-8 bg-white/10 mx-0.5" />
          

          {/* Leave call */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="bg-maya-danger hover:bg-red-700 text-white rounded-full px-5 border-0 shadow-lg shadow-red-500/20 transition-all duration-200"
                onClick={onLeaveCall}
                aria-label="Leave call">
                
                <PhoneOff className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">
                  Leave
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Leave Call</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>);

});