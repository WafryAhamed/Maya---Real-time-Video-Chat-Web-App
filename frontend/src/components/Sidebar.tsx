import React, { memo, Component } from 'react';
// ============================================
// Maya — Sidebar Component (Enhanced with AI Tab)
// ============================================
// Tabbed sidebar with Chat, Participants, and AI Assistant views.
import { X, MessageSquare, Users, Bot } from 'lucide-react';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Badge } from './ui/Badge';
import { ChatBox } from './ChatBox';
import { ParticipantList } from './ParticipantList';
import { AIChat } from './AIChat';
import type { AIMessage, ChatItem, Participant, TypingUser } from '../types';
interface SidebarProps {
  isOpen: boolean;
  activeTab: 'chat' | 'participants' | 'ai';
  messages: ChatItem[];
  participants: Participant[];
  typingUsers: TypingUser[];
  currentUserId: string;
  activeSpeakerId: string | null;
  unreadMessages: number;
  aiMessages: AIMessage[];
  aiIsTyping: boolean;
  onClose: () => void;
  onSendMessage: (content: string) => void;
  onTabChange: (tab: 'chat' | 'participants' | 'ai') => void;
  onPinUser: (userId: string) => void;
  onSendAIMessage: (content: string) => void;
  onClearAIHistory: () => void;
}
export const Sidebar = memo(function Sidebar({
  isOpen,
  activeTab,
  messages,
  participants,
  typingUsers,
  currentUserId,
  activeSpeakerId,
  unreadMessages,
  aiMessages,
  aiIsTyping,
  onClose,
  onSendMessage,
  onTabChange,
  onPinUser,
  onSendAIMessage,
  onClearAIHistory
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed right-0 top-0 bottom-0 z-40
        w-full sm:w-[380px]
        bg-maya-accent
        shadow-2xl shadow-black/20
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}
      role="complementary"
      aria-label="Sidebar"
      aria-hidden={!isOpen}>
      
      {/* Header with tabs */}
      <div className="bg-white/50">
        <div className="flex items-center justify-between px-2 pt-3 pb-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
            onTabChange(v as 'chat' | 'participants' | 'ai')
            }
            className="flex-1">
            
            <TabsList
              variant="line"
              className="bg-transparent w-full justify-start gap-0 border-b-0">
              
              <TabsTrigger
                value="chat"
                className="text-xs sm:text-sm gap-1 data-[state=active]:text-maya-primary px-2 sm:px-3">
                
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
                {unreadMessages > 0 && activeTab !== 'chat' &&
                <span className="ml-0.5 h-4 min-w-[16px] px-1 text-[9px] bg-maya-danger text-white rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                }
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="text-xs sm:text-sm gap-1 data-[state=active]:text-maya-primary px-2 sm:px-3">
                
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">People</span> (
                {participants.length})
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="text-xs sm:text-sm gap-1 data-[state=active]:text-purple-600 px-2 sm:px-3">
                
                <Bot className="h-3.5 w-3.5" />
                AI
                <Badge className="bg-gradient-to-r from-purple-500/20 to-maya-primary/20 text-purple-700 border-0 text-[8px] px-1 py-0 h-3.5 leading-none">
                  ✨
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="icon-sm"
            variant="ghost"
            className="text-maya-text hover:text-maya-dark hover:bg-maya-primary/10 rounded-full shrink-0 ml-1"
            onClick={onClose}
            aria-label="Close sidebar">
            
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="bg-maya-primary/10" />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' &&
        <ChatBox
          messages={messages}
          currentUserId={currentUserId}
          typingUsers={typingUsers}
          onSendMessage={onSendMessage} />

        }
        {activeTab === 'participants' &&
        <ParticipantList
          participants={participants}
          localUserId={currentUserId}
          activeSpeakerId={activeSpeakerId}
          onPinUser={onPinUser} />

        }
        {activeTab === 'ai' &&
        <AIChat
          messages={aiMessages}
          isTyping={aiIsTyping}
          onSendMessage={onSendAIMessage}
          onClearHistory={onClearAIHistory} />

        }
      </div>
    </aside>);

});