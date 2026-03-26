import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  memo,
  Component } from
'react';
// ============================================
// Maya — ChatBox Component (Enhanced)
// ============================================
// Chat with typing indicators, system messages, emoji picker,
// message grouping, and scroll-to-bottom button.
import {
  Send,
  ChevronDown,
  Smile,
  LogIn,
  LogOut,
  Hand as HandIcon } from
'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import { Avatar, AvatarFallback } from './ui/Avatar';
import type { ChatItem, ChatMessage, SystemMessage, TypingUser } from '../types';
import { isSystemMessage } from '../types';
import { MAX_MESSAGE_LENGTH, EMOJI_LIST } from '../utils/constants';
interface ChatBoxProps {
  messages: ChatItem[];
  currentUserId: string;
  typingUsers: TypingUser[];
  onSendMessage: (content: string) => void;
}
function getInitials(name: string): string {
  return name.
  split(' ').
  map((n) => n[0]).
  join('').
  toUpperCase().
  slice(0, 2);
}
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
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
/** System message component */
function SystemMessageItem({ msg }: {msg: SystemMessage;}) {
  const iconMap = {
    join: <LogIn className="h-3 w-3" />,
    leave: <LogOut className="h-3 w-3" />,
    mute: null,
    'hand-raise': <HandIcon className="h-3 w-3" />
  };
  const textMap = {
    join: `${msg.userName} joined the call`,
    leave: `${msg.userName} left the call`,
    mute: `${msg.userName} muted their mic`,
    'hand-raise': `${msg.userName} raised their hand`
  };
  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      <div className="flex items-center gap-1.5 text-maya-text/60 text-xs bg-white/40 rounded-full px-3 py-1">
        {iconMap[msg.type]}
        <span>{textMap[msg.type]}</span>
        <span className="opacity-50">· {formatTime(msg.timestamp)}</span>
      </div>
    </div>);

}
export const ChatBox = memo(function ChatBox({
  messages,
  currentUserId,
  typingUsers,
  onSendMessage
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  // Check if user is near bottom of scroll
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const isNear =
    container.scrollHeight - container.scrollTop - container.clientHeight <
    threshold;
    isNearBottomRef.current = isNear;
    setShowScrollButton(!isNear);
  }, []);
  // Auto-scroll only if near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      setShowScrollButton(true);
    }
  }, [messages]);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
    setShowScrollButton(false);
  }, []);
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return;
    onSendMessage(trimmed);
    setInputValue('');
    setShowEmojiPicker(false);
  }, [inputValue, onSendMessage]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );
  const handleEmojiClick = useCallback((emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }, []);
  // Group consecutive messages from same sender
  const groupedMessages = useMemo(() => {
    return messages.map((msg, idx) => {
      if (isSystemMessage(msg))
      return {
        item: msg,
        isGrouped: false
      };
      const prev = idx > 0 ? messages[idx - 1] : null;
      const isGrouped =
      prev &&
      !isSystemMessage(prev) &&
      (prev as ChatMessage).userId === msg.userId &&
      msg.timestamp - prev.timestamp < 60000;
      return {
        item: msg,
        isGrouped
      };
    });
  }, [messages]);
  // Active typing users (exclude self)
  const activeTypers = useMemo(
    () => typingUsers.filter((t) => t.userId !== currentUserId),
    [typingUsers, currentUserId]
  );
  return (
    <div className="flex flex-col h-full relative">
      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-2 maya-scrollbar"
        onScroll={checkScrollPosition}>
        
        <div className="space-y-1">
          {messages.length === 0 &&
          <div className="flex items-center justify-center h-32">
              <p className="text-maya-text text-sm text-center">
                No messages yet.
                <br />
                Start the conversation!
              </p>
            </div>
          }

          {groupedMessages.map(({ item, isGrouped }) => {
            if (isSystemMessage(item)) {
              return <SystemMessageItem key={item.id} msg={item} />;
            }
            const msg = item as ChatMessage;
            const isOwn = msg.userId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}>
                
                {!isOwn && !isGrouped &&
                <Avatar size="sm">
                    <AvatarFallback
                    className={`${getColorFromName(msg.userName)} text-white text-xs`}>
                    
                      {getInitials(msg.userName)}
                    </AvatarFallback>
                  </Avatar>
                }
                {!isOwn && isGrouped && <div className="w-8 shrink-0" />}

                <div
                  className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  
                  {!isOwn && !isGrouped &&
                  <p className="text-xs text-maya-text mb-0.5 font-medium">
                      {msg.userName}
                    </p>
                  }
                  <div
                    className={`rounded-xl px-3 py-2 text-sm ${isOwn ? 'bg-maya-primary text-white rounded-tr-sm' : 'bg-white/80 text-gray-800 rounded-tl-sm'}`}>
                    
                    {msg.content}
                  </div>
                  {!isGrouped &&
                  <p className="text-[10px] text-maya-text mt-0.5 px-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  }
                </div>
              </div>);

          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Typing indicator */}
      {activeTypers.length > 0 &&
      <div className="px-3 py-1.5 border-t border-maya-primary/5">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <span
              className="w-1.5 h-1.5 bg-maya-primary rounded-full animate-bounce"
              style={{
                animationDelay: '0ms'
              }} />
            
              <span
              className="w-1.5 h-1.5 bg-maya-primary rounded-full animate-bounce"
              style={{
                animationDelay: '150ms'
              }} />
            
              <span
              className="w-1.5 h-1.5 bg-maya-primary rounded-full animate-bounce"
              style={{
                animationDelay: '300ms'
              }} />
            
            </div>
            <span className="text-xs text-maya-text">
              {activeTypers.length === 1 ?
            `${activeTypers[0].userName} is typing...` :
            `${activeTypers.length} people are typing...`}
            </span>
          </div>
        </div>
      }

      {/* Scroll to bottom button */}
      {showScrollButton &&
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
          <Button
          size="sm"
          className="bg-maya-primary hover:bg-maya-primary/80 text-white rounded-full shadow-lg border-0 gap-1 px-3"
          onClick={scrollToBottom}>
          
            <ChevronDown className="h-3 w-3" />
            New messages
          </Button>
        </div>
      }

      {/* Emoji picker */}
      {showEmojiPicker &&
      <div className="absolute bottom-14 left-3 right-3 bg-white rounded-xl shadow-xl border border-maya-primary/10 p-2 z-20">
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji) =>
          <button
            key={emoji}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-maya-accent transition-colors text-lg"
            onClick={() => handleEmojiClick(emoji)}
            aria-label={`Insert ${emoji}`}>
            
                {emoji}
              </button>
          )}
          </div>
        </div>
      }

      {/* Input area */}
      <div className="p-3 border-t border-maya-primary/10">
        <div className="flex gap-2 items-center">
          <Button
            size="icon-sm"
            variant="ghost"
            className={`shrink-0 rounded-full ${showEmojiPicker ? 'text-maya-primary bg-maya-primary/10' : 'text-maya-text hover:text-maya-primary'}`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Toggle emoji picker">
            
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowEmojiPicker(false)}
            placeholder="Type a message..."
            className="flex-1 bg-white border-maya-primary/20 text-gray-800 placeholder:text-maya-text text-sm"
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Chat message input" />
          
          <Button
            size="icon"
            className="bg-maya-primary hover:bg-maya-primary/80 text-white rounded-lg border-0 shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            aria-label="Send message">
            
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>);

});