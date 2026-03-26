// ============================================
// Maya Backend — Room Manager Utility
// ============================================

import { Room } from '../models';
import { logger } from './logger';

interface RoomSession {
  roomId: string;
  participants: Map<string, {
    socketId: string;
    userName: string;
    joinedAt: number;
  }>;
  createdAt: number;
  messages: any[];
  polls: Map<string, any>;
}

class RoomManager {
  private rooms: Map<string, RoomSession> = new Map();
  private userRooms: Map<string, string> = new Map(); // socketId -> roomId

  /**
   * Create or get a room
   */
  getOrCreateRoom(roomId: string): RoomSession {
    if (!this.rooms.has(roomId)) {
      const room: RoomSession = {
        roomId,
        participants: new Map(),
        createdAt: Date.now(),
        messages: [],
        polls: new Map(),
      };
      this.rooms.set(roomId, room);
      logger.info(`Created room: ${roomId}`);
    }
    return this.rooms.get(roomId)!;
  }

  /**
   * Add user to room
   */
  addUserToRoom(
    roomId: string,
    socketId: string,
    userName: string
  ): { success: boolean; participantCount: number } {
    const room = this.getOrCreateRoom(roomId);
    
    // Prevent duplicate joins
    if (room.participants.has(socketId)) {
      logger.warn(`User ${socketId} already in room ${roomId}`);
      return { success: false, participantCount: room.participants.size };
    }

    room.participants.set(socketId, {
      socketId,
      userName,
      joinedAt: Date.now(),
    });
    
    this.userRooms.set(socketId, roomId);
    logger.info(`User ${socketId} joined room ${roomId}. Total: ${room.participants.size}`);
    
    return { success: true, participantCount: room.participants.size };
  }

  /**
   * Remove user from room
   */
  removeUserFromRoom(socketId: string): {
    roomId: string | null;
    success: boolean;
    participantCount: number;
  } {
    const roomId = this.userRooms.get(socketId);
    
    if (!roomId) {
      return { roomId: null, success: false, participantCount: 0 };
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      this.userRooms.delete(socketId);
      return { roomId, success: false, participantCount: 0 };
    }

    const hadrUser = room.participants.has(socketId);
    room.participants.delete(socketId);
    this.userRooms.delete(socketId);

    logger.info(
      `User ${socketId} left room ${roomId}. Remaining: ${room.participants.size}`
    );

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      logger.info(`Room ${roomId} auto-cleaned (empty)`);
    }

    return {
      roomId,
      success: hadrUser,
      participantCount: room.participants.size,
    };
  }

  /**
   * Get all participants in a room
   */
  getRoomParticipants(roomId: string): Array<{
    socketId: string;
    userName: string;
    joinedAt: number;
  }> {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }

  /**
   * Get a specific room
   */
  getRoom(roomId: string): RoomSession | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get user's current room
   */
  getUserRoom(socketId: string): string | null {
    return this.userRooms.get(socketId) || null;
  }

  /**
   * Store a message in room
   */
  addMessageToRoom(roomId: string, message: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.messages.push(message);
      // Keep only last 1000 messages in memory
      if (room.messages.length > 1000) {
        room.messages = room.messages.slice(-1000);
      }
    }
  }

  /**
   * Get recent messages in room
   */
  getRoomMessages(roomId: string, limit: number = 50): any[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return room.messages.slice(-limit);
  }

  /**
   * Get room statistics
   */
  getStats(): {
    totalRooms: number;
    totalUsers: number;
  } {
    let totalUsers = 0;
    this.rooms.forEach((room) => {
      totalUsers += room.participants.size;
    });
    return {
      totalRooms: this.rooms.size,
      totalUsers,
    };
  }

  /**
   * Cleanup old rooms (>1 hour inactive)
   */
  cleanupInactiveRooms(): number {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    let cleaned = 0;

    for (const [roomId, room] of this.rooms) {
      if (room.participants.size === 0 && now - room.createdAt > maxAge) {
        this.rooms.delete(roomId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} inactive rooms`);
    }

    return cleaned;
  }
}

export const roomManager = new RoomManager();
