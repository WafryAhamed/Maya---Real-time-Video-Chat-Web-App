import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  memo,
  Component } from
'react';
// ============================================
// Maya — AIChat Component
// ============================================
// AI meeting assistant chat interface with streaming responses,
// slash commands, and rich markdown-like formatting.

import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Zap,
  FileText,
  CheckSquare,
  Heart,
  Globe,
  HelpCircle } from
'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import { Badge } from './ui/Badge';
import type { AIMessage } from '../types';
import { AI_ASSISTANT_NAME } from '../utils/constants';
interface AIChatProps {
  messages: AIMessage[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onClearHistory: () => void;
}
/** Quick command buttons */
const QUICK_COMMANDS = [
{
  label: 'Summarize',
  command: '/summarize',
  icon: FileText
},
{
  label: 'Actions',
  command: '/actions',
  icon: CheckSquare
},
{
  label: 'Mood',
  command: '/mood',
  icon: Heart
},
{
  label: 'Notes',
  command: '/notes',
  icon: Zap
},
{
  label: 'Translate',
  command: '/translate',
  icon: Globe
},
{
  label: 'Help',
  command: '/help',
  icon: HelpCircle
}] as
const;
/** Format timestamp */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}
/** Simple markdown-like rendering for bold, italic, bullet points */
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    let processed: React.ReactNode = line;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    if (parts.length > 1) {
      processed = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>);

        }
        // Italic: *text*
        const italicParts = part.split(/(\*[^*]+\*)/g);
        if (italicParts.length > 1) {
          return italicParts.map((ip, k) => {
            if (ip.startsWith('*') && ip.endsWith('*')) {
              return (
                <em key={k} className="italic">
                  {ip.slice(1, -1)}
                </em>);

            }
            return ip;
          });
        }
        return part;
      });
    }
    // Bullet points
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const isNumbered = /^\d+\./.test(line.trim());
    if (isBullet || isNumbered) {
      return (
        <div key={i} className={`${isBullet ? 'pl-2' : 'pl-1'} py-0.5`}>
          {processed}
        </div>);

    }
    return (
      <div key={i} className={line.trim() === '' ? 'h-2' : 'py-0.5'}>
        {processed}
      </div>);

  });
}
export const AIChat = memo(function AIChat({
  messages,
  isTyping,
  onSendMessage,
  onClearHistory
}: AIChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputValue('');
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
  const handleQuickCommand = useCallback(
    (command: string) => {
      onSendMessage(command);
    },
    [onSendMessage]
  );
  return (
    <div className="flex flex-col h-full">
      {/* Header with clear button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-maya-primary/10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-maya-primary flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-maya-dark">
            {AI_ASSISTANT_NAME}
          </span>
          <Badge className="bg-gradient-to-r from-purple-500/20 to-maya-primary/20 text-purple-700 border-0 text-[10px] px-1.5">
            AI
          </Badge>
        </div>
        <Button
          size="icon-xs"
          variant="ghost"
          className="text-maya-text hover:text-maya-danger rounded-full h-6 w-6"
          onClick={onClearHistory}
          aria-label="Clear AI chat history">
          
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Quick command chips */}
      <div className="px-3 py-2 border-b border-maya-primary/5">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {QUICK_COMMANDS.map(({ label, command, icon: Icon }) =>
          <button
            key={command}
            onClick={() => handleQuickCommand(command)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 hover:bg-maya-primary/10 text-maya-text hover:text-maya-primary text-xs font-medium transition-colors shrink-0 border border-maya-primary/10">
            
              <Icon className="h-3 w-3" />
              {label}
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3 maya-scrollbar">
        
        <div className="space-y-4">
          {messages.map((msg) =>
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            
              {/* Avatar */}
              {msg.role === 'assistant' ?
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-maya-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div> :

            <div className="h-7 w-7 rounded-full bg-maya-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-maya-primary" />
                </div>
            }

              {/* Message bubble */}
              <div
              className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
                <div
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-maya-primary text-white rounded-tr-sm' : 'bg-white/90 text-gray-800 rounded-tl-sm border border-purple-100/50 shadow-sm'}`}>
                
                  {msg.role === 'assistant' ?
                renderContent(msg.content) :
                msg.content}
                  {msg.isStreaming &&
                <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse rounded-sm" />
                }
                </div>
                <p className="text-[10px] text-maya-text mt-0.5 px-1">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isTyping &&
          <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-maya-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
              </div>
              <div className="bg-white/90 rounded-xl rounded-tl-sm px-3 py-2 border border-purple-100/50 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '0ms'
                  }} />
                
                  <span
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '150ms'
                  }} />
                
                  <span
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '300ms'
                  }} />
                
                  <span className="text-xs text-purple-500 ml-1.5">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          }

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-maya-primary/10">
        <div className="flex gap-2 items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Maya AI or type /command..."
            className="flex-1 bg-white border-purple-200/50 text-gray-800 placeholder:text-maya-text text-sm focus:ring-purple-300/50"
            aria-label="AI chat input" />
          
          <Button
            size="icon"
            className="bg-gradient-to-r from-purple-500 to-maya-primary hover:from-purple-600 hover:to-maya-primary/90 text-white rounded-lg border-0 shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send to AI">
            
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>);

});