// ============================================
// Maya — useAIAssistant Hook
// ============================================
// Manages AI chatbot state with simulated streaming responses,
// slash command handling, and meeting intelligence features.

import { useCallback, useRef, useState } from 'react';
import type { AIMessage, AISlashCommand } from '../types';
import {
  AI_ASSISTANT_NAME,
  AI_RESPONSES,
  AI_WELCOME_MESSAGE } from
'../utils/constants';

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Check if input is a slash command */
function parseSlashCommand(
input: string)
: {command: AISlashCommand;args: string;} | null {
  const trimmed = input.trim().toLowerCase();
  const commands: AISlashCommand[] = [
  '/summarize',
  '/actions',
  '/mood',
  '/notes',
  '/help',
  '/translate'];

  for (const cmd of commands) {
    if (trimmed.startsWith(cmd)) {
      return { command: cmd, args: trimmed.slice(cmd.length).trim() };
    }
  }
  return null;
}

/** Get AI response based on command or general query */
function getAIResponse(command: AISlashCommand | null): string {
  if (!command) {
    return randomPick(AI_RESPONSES.general);
  }
  const key = command.replace('/', '') as keyof typeof AI_RESPONSES;
  const responses = AI_RESPONSES[key];
  if (responses) {
    return randomPick(responses);
  }
  return randomPick(AI_RESPONSES.general);
}

interface UseAIAssistantReturn {
  messages: AIMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => void;
  clearHistory: () => void;
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<AIMessage[]>(() => [
  {
    id: generateId(),
    role: 'assistant',
    content: AI_WELCOME_MESSAGE,
    timestamp: Date.now()
  }]
  );
  const [isTyping, setIsTyping] = useState(false);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: AIMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);

    // Parse command
    const parsed = parseSlashCommand(trimmed);
    const fullResponse = getAIResponse(parsed?.command ?? null);

    // Simulate AI thinking delay
    setIsTyping(true);

    const thinkDelay = 800 + Math.random() * 1200;

    streamTimerRef.current = setTimeout(() => {
      setIsTyping(false);

      // Create streaming message
      const aiMsgId = generateId();
      const aiMsg: AIMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Stream characters progressively
      let charIndex = 0;
      const charsPerTick = 3 + Math.floor(Math.random() * 4); // 3-6 chars per tick

      streamIntervalRef.current = setInterval(() => {
        charIndex = Math.min(charIndex + charsPerTick, fullResponse.length);
        const partial = fullResponse.slice(0, charIndex);
        const isDone = charIndex >= fullResponse.length;

        setMessages((prev) =>
        prev.map((m) =>
        m.id === aiMsgId ?
        { ...m, content: partial, isStreaming: !isDone } :
        m
        )
        );

        if (isDone && streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
      }, 30);
    }, thinkDelay);
  }, []);

  const clearHistory = useCallback(() => {
    // Clean up any ongoing streams
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsTyping(false);
    setMessages([
    {
      id: generateId(),
      role: 'assistant',
      content: AI_WELCOME_MESSAGE,
      timestamp: Date.now()
    }]
    );
  }, []);

  return { messages, isTyping, sendMessage, clearHistory };
}