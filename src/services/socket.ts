// ============================================
// Maya — Mock Socket.IO Service (Enhanced)
// ============================================
// Fully mocked Socket.IO-like client with rich simulated events:
// speaking activity, typing indicators, connection quality changes,
// dynamic user joins/leaves, chat bursts, and hand raises.

import type {
  ChatMessage,
  ConnectionQuality,
  Participant,
  TypingUser,
  SystemMessage } from
'../types';
import {
  MOCK_USER_NAMES,
  MOCK_CHAT_REPLIES,
  SIGNAL_QUALITIES } from
'../utils/constants';

type EventCallback = (...args: unknown[]) => void;

/** Generate a random ID */
function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

/** Pick a random item from an array */
function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random integer between min and max (inclusive) */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Create a mock participant */
function createMockParticipant(
name: string,
role: 'host' | 'participant')
: Participant {
  return {
    id: generateId(),
    name,
    isMuted: Math.random() > 0.5,
    isCameraOff: Math.random() > 0.7,
    isScreenSharing: false,
    role,
    connectionQuality: randomPick([
    'excellent',
    'good',
    'good',
    'excellent'] as
    const),
    audioLevel: 0,
    isHandRaised: false,
    isPinned: false,
    joinedAt: Date.now() - randomInt(0, 300000)
  };
}

/**
 * MockSocket — Simulates Socket.IO client behavior with rich real-time events.
 */
class MockSocket {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private _connected: boolean = false;
  private _id: string = generateId();
  private simulationTimers: ReturnType<typeof setTimeout>[] = [];
  private simulationIntervals: ReturnType<typeof setInterval>[] = [];
  private mockParticipants: Participant[] = [];

  get connected(): boolean {
    return this._connected;
  }

  get id(): string {
    return this._id;
  }

  /** Register an event listener */
  on(event: string, callback: EventCallback): MockSocket {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  /** Remove an event listener */
  off(event: string, callback?: EventCallback): MockSocket {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  /** Emit an event (triggers local listeners) */
  emit(event: string, ...args: unknown[]): MockSocket {
    setTimeout(() => {
      this.triggerEvent(event, ...args);
      this.handleMockResponse(event, args[0]);
    }, 50);
    return this;
  }

  /** Connect to mock server */
  connect(): MockSocket {
    setTimeout(() => {
      this._connected = true;
      this.triggerEvent('connect');
    }, 100);
    return this;
  }

  /** Disconnect from mock server */
  disconnect(): MockSocket {
    this._connected = false;
    this.stopAllSimulations();
    this.triggerEvent('disconnect');
    return this;
  }

  /** Trigger event on all registered listeners */
  private triggerEvent(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`[MockSocket] Error in ${event} handler:`, err);
        }
      });
    }
  }

  /** Simulate server responses based on emitted events */
  private handleMockResponse(event: string, _data: unknown): void {
    switch (event) {
      case 'join-room':{
          // Create initial participants — first is host
          this.mockParticipants = MOCK_USER_NAMES.slice(0, 2).map((name, i) =>
          createMockParticipant(name, i === 0 ? 'host' : 'participant')
          );

          // Emit room-users after short delay
          const t1 = setTimeout(() => {
            this.triggerEvent('room-users', { users: [...this.mockParticipants] });
            // System messages for existing users
            this.mockParticipants.forEach((p) => {
              this.triggerEvent('system-message', {
                id: generateId(),
                type: 'join',
                userName: p.name,
                timestamp: p.joinedAt
              } as SystemMessage);
            });
          }, 400);

          // Stagger additional users joining
          const t2 = setTimeout(() => {
            const newUser = createMockParticipant(
              MOCK_USER_NAMES[2],
              'participant'
            );
            this.mockParticipants.push(newUser);
            this.triggerEvent('user-joined', { user: newUser });
            this.triggerEvent('system-message', {
              id: generateId(),
              type: 'join',
              userName: newUser.name,
              timestamp: Date.now()
            } as SystemMessage);
          }, 2500);

          const t3 = setTimeout(() => {
            const newUser = createMockParticipant(
              MOCK_USER_NAMES[3],
              'participant'
            );
            this.mockParticipants.push(newUser);
            this.triggerEvent('user-joined', { user: newUser });
            this.triggerEvent('system-message', {
              id: generateId(),
              type: 'join',
              userName: newUser.name,
              timestamp: Date.now()
            } as SystemMessage);
          }, 5000);

          this.simulationTimers.push(t1, t2, t3);

          // Start periodic simulations
          this.startPeriodicSimulations();
          break;
        }

      case 'chat-message':{
          // Simulate typing indicator, then reply
          if (this.mockParticipants.length === 0) break;
          const replier = randomPick(this.mockParticipants);
          const typingUser: TypingUser = {
            userId: replier.id,
            userName: replier.name
          };

          const tTyping = setTimeout(() => {
            this.triggerEvent('typing-start', typingUser);
          }, 800);

          const tReply = setTimeout(
            () => {
              this.triggerEvent('typing-stop', { userId: replier.id });
              const reply: ChatMessage = {
                id: generateId(),
                userId: replier.id,
                userName: replier.name,
                content: randomPick(MOCK_CHAT_REPLIES),
                timestamp: Date.now()
              };
              this.triggerEvent('chat-message', reply);
            },
            2000 + Math.random() * 2000
          );

          this.simulationTimers.push(tTyping, tReply);
          break;
        }
    }
  }

  /** Start all periodic simulation loops */
  private startPeriodicSimulations(): void {
    // Speaking activity — every 3-5s
    const speakingInterval = setInterval(
      () => {
        if (this.mockParticipants.length === 0) return;
        const speaker = randomPick(this.mockParticipants);
        const level = Math.random() > 0.4 ? randomInt(40, 95) : randomInt(0, 15);
        this.triggerEvent('speaking-activity', {
          userId: speaker.id,
          audioLevel: level
        });
      },
      randomInt(3000, 5000)
    );

    // Connection quality changes — every 12-18s
    const connectionInterval = setInterval(
      () => {
        if (this.mockParticipants.length === 0) return;
        const user = randomPick(this.mockParticipants);
        const quality: ConnectionQuality = randomPick(SIGNAL_QUALITIES);
        user.connectionQuality = quality;
        this.triggerEvent('connection-quality', {
          userId: user.id,
          quality
        });
      },
      randomInt(12000, 18000)
    );

    // Typing indicators — every 8-15s
    const typingInterval = setInterval(
      () => {
        if (this.mockParticipants.length === 0) return;
        const typer = randomPick(this.mockParticipants);
        this.triggerEvent('typing-start', {
          userId: typer.id,
          userName: typer.name
        } as TypingUser);
        const stopTimer = setTimeout(
          () => {
            this.triggerEvent('typing-stop', { userId: typer.id });
          },
          randomInt(2000, 4000)
        );
        this.simulationTimers.push(stopTimer);
      },
      randomInt(8000, 15000)
    );

    // Hand raise — after 10s, then occasionally
    const handTimer = setTimeout(() => {
      if (this.mockParticipants.length === 0) return;
      const raiser = randomPick(this.mockParticipants);
      raiser.isHandRaised = true;
      this.triggerEvent('hand-raised', {
        userId: raiser.id,
        isHandRaised: true
      });
      // Lower hand after 6s
      const lowerTimer = setTimeout(() => {
        raiser.isHandRaised = false;
        this.triggerEvent('hand-raised', {
          userId: raiser.id,
          isHandRaised: false
        });
      }, 6000);
      this.simulationTimers.push(lowerTimer);
    }, 10000);

    // User leaves after 20s
    const leaveTimer = setTimeout(() => {
      if (this.mockParticipants.length > 2) {
        const leaver = this.mockParticipants.pop()!;
        this.triggerEvent('user-left', { userId: leaver.id });
        this.triggerEvent('system-message', {
          id: generateId(),
          type: 'leave',
          userName: leaver.name,
          timestamp: Date.now()
        } as SystemMessage);
      }
    }, 20000);

    // Chat burst — after 12s
    const burstTimer = setTimeout(() => {
      if (this.mockParticipants.length === 0) return;
      const burstMessages = 3;
      for (let i = 0; i < burstMessages; i++) {
        const sender = randomPick(this.mockParticipants);
        const msgTimer = setTimeout(() => {
          const msg: ChatMessage = {
            id: generateId(),
            userId: sender.id,
            userName: sender.name,
            content: randomPick(MOCK_CHAT_REPLIES),
            timestamp: Date.now()
          };
          this.triggerEvent('chat-message', msg);
        }, i * 1200);
        this.simulationTimers.push(msgTimer);
      }
    }, 12000);

    // Mute toggle simulation — after 7s
    const muteTimer = setTimeout(() => {
      if (this.mockParticipants.length === 0) return;
      const user = randomPick(this.mockParticipants);
      user.isMuted = !user.isMuted;
      this.triggerEvent('toggle-audio', {
        userId: user.id,
        isMuted: user.isMuted
      });
    }, 7000);

    this.simulationIntervals.push(
      speakingInterval,
      connectionInterval,
      typingInterval
    );
    this.simulationTimers.push(handTimer, leaveTimer, burstTimer, muteTimer);
  }

  /** Stop all simulations */
  private stopAllSimulations(): void {
    this.simulationTimers.forEach(clearTimeout);
    this.simulationTimers = [];
    this.simulationIntervals.forEach(clearInterval);
    this.simulationIntervals = [];
  }

  /** Clean up all listeners and timers */
  removeAllListeners(): void {
    this.listeners.clear();
    this.stopAllSimulations();
    this.mockParticipants = [];
  }
}

/** Singleton mock socket instance */
let socketInstance: MockSocket | null = null;

/** Get or create the mock socket instance */
export function getSocket(): MockSocket {
  if (!socketInstance) {
    socketInstance = new MockSocket();
  }
  return socketInstance;
}

/** Create a fresh socket connection */
export function createSocket(): MockSocket {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance.removeAllListeners();
  }
  socketInstance = new MockSocket();
  return socketInstance;
}

export type { MockSocket };