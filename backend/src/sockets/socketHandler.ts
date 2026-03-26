// ============================================
// Maya Backend — Socket.IO Event Handler
// ============================================

import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Message, Room, User, Poll } from '../models';
import { roomManager } from '../utils/room-manager';
import { logger } from '../utils/logger';

export interface ExtendedSocket extends Socket {
  userId?: string;
  userName?: string;
  roomId?: string;
}

/**
 * Initialize Socket.IO event handlers
 */
export function initializeSocketHandlers(io: Server): void {
  io.on('connection', (socket: ExtendedSocket) => {
    logger.info(`✓ User connected: ${socket.id}`);

    // ========================================
    // Join Room
    // ========================================
    socket.on('join-room', async (data: any) => {
      try {
        const { roomId, user } = data;

        if (!roomId || !user || !user.name) {
          socket.emit('error', { message: 'Invalid join-room data' });
          return;
        }

        socket.userId = user.id;
        socket.userName = user.name;
        socket.roomId = roomId;

        // Add to Socket.IO room
        socket.join(roomId);

        // Add to room manager
        const { success, participantCount } = roomManager.addUserToRoom(
          roomId,
          socket.id,
          user.name
        );

        if (!success && participantCount > 0) {
          logger.warn(`Duplicate join attempt for ${socket.id}`);
        }

        // Save to database
        try {
          let room = await Room.findOne({ roomId });
          if (!room) {
            room = new Room({
              roomId,
              name: `Meeting ${roomId}`,
              participants: [],
              createdBy: user.id,
            });
          }

          // Add participant
          const participantExists = room.participants.some(
            (p) => p.socketId === socket.id
          );
          if (!participantExists) {
            room.participants.push({
              socketId: socket.id,
              userId: new (require('mongoose')).Types.ObjectId(),
              userName: user.name,
              joinedAt: new Date(),
              role: participantCount === 1 ? 'host' : 'participant',
            });
          }

          room.isActive = true;
          await room.save();
        } catch (dbError) {
          logger.error('Error saving room to DB:', dbError);
        }

        // Create system message
        const systemMessage = {
          id: uuidv4(),
          type: 'join',
          userName: user.name,
          timestamp: Date.now(),
        };

        // Save system message to DB
        try {
          await Message.create({
            roomId,
            userId: user.id,
            userName: user.name,
            content: `${user.name} joined the meeting`,
            type: 'system',
            systemType: 'join',
          });
        } catch (dbError) {
          logger.error('Error saving system message:', dbError);
        }

        // Emit to room
        io.to(roomId).emit('system-message', systemMessage);

        // Send room users list
        const participants = roomManager.getRoomParticipants(roomId);
        io.to(roomId).emit('room-users', {
          users: participants.map((p) => ({
            id: p.socketId,
            name: p.userName,
            isMuted: false,
            isCameraOff: false,
            isScreenSharing: false,
            role: 'participant',
            connectionQuality: 'excellent',
            audioLevel: 0,
            isHandRaised: false,
            isPinned: false,
            joinedAt: p.joinedAt,
          })),
        });

        io.to(roomId).emit('user-joined', {
          user: {
            id: user.id,
            name: user.name,
            isMuted: user.isMuted || false,
            isCameraOff: user.isCameraOff || false,
            isScreenSharing: user.isScreenSharing || false,
            role: participantCount === 1 ? 'host' : 'participant',
            connectionQuality: 'excellent',
            audioLevel: 0,
            isHandRaised: false,
            isPinned: false,
            joinedAt: Date.now(),
          },
        });

        logger.info(
          `User ${user.name} (${socket.id}) joined room ${roomId}`
        );
      } catch (error) {
        logger.error('Error in join-room handler:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ========================================
    // Leave Room
    // ========================================
    socket.on('leave-room', async (data: any) => {
      try {
        const { roomId, userId } = data;

        if (!roomId || !userId) {
          return;
        }

        const { success, participantCount } = roomManager.removeUserFromRoom(
          socket.id
        );

        if (!success) {
          return;
        }

        // Update database
        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.participants = room.participants.filter(
              (p) => p.socketId !== socket.id
            );
            if (room.participants.length === 0) {
              room.isActive = false;
            }
            await room.save();
          }
        } catch (dbError) {
          logger.error('Error updating room on leave:', dbError);
        }

        // Create system message
        const systemMessage = {
          id: uuidv4(),
          type: 'leave',
          userName: socket.userName || 'User',
          timestamp: Date.now(),
        };

        // Save system message to DB
        try {
          await Message.create({
            roomId,
            userId,
            userName: socket.userName || 'User',
            content: `${socket.userName || 'User'} left the meeting`,
            type: 'system',
            systemType: 'leave',
          });
        } catch (dbError) {
          logger.error('Error saving leave message:', dbError);
        }

        // Emit to room
        io.to(roomId).emit('system-message', systemMessage);
        io.to(roomId).emit('user-left', { userId });

        // Leave Socket.IO room
        socket.leave(roomId);

        logger.info(
          `User ${socket.userName} (${socket.id}) left room ${roomId}. Remaining: ${participantCount}`
        );
      } catch (error) {
        logger.error('Error in leave-room handler:', error);
      }
    });

    // ========================================
    // Chat Message
    // ========================================
    socket.on('chat-message', async (data: any) => {
      try {
        const { content } = data;
        const roomId = socket.roomId;
        const userId = socket.userId;
        const userName = socket.userName;

        if (!roomId || !content || !userId || !userName) {
          return;
        }

        const messageData = {
          id: uuidv4(),
          userId,
          userName,
          content: content.trim().substring(0, 5000),
          timestamp: Date.now(),
        };

        // Save to database
        try {
          await Message.create({
            roomId,
            userId,
            userName,
            content: messageData.content,
            type: 'chat',
          });
        } catch (dbError) {
          logger.error('Error saving chat message:', dbError);
        }

        // Add to room manager
        roomManager.addMessageToRoom(roomId, messageData);

        // Emit to room
        io.to(roomId).emit('chat-message', messageData);

        logger.debug(`Chat message in ${roomId} from ${userName}`);
      } catch (error) {
        logger.error('Error in chat-message handler:', error);
      }
    });

    // ========================================
    // Typing Indicators
    // ========================================
    socket.on('typing-start', (data: any) => {
      try {
        const { userId, userName } = data;
        const roomId = socket.roomId;

        if (!roomId) return;

        socket.to(roomId).emit('typing-start', {
          userId: userId || socket.userId,
          userName: userName || socket.userName,
        });
      } catch (error) {
        logger.error('Error in typing-start handler:', error);
      }
    });

    socket.on('typing-stop', (data: any) => {
      try {
        const { userId } = data;
        const roomId = socket.roomId;

        if (!roomId) return;

        socket.to(roomId).emit('typing-stop', {
          userId: userId || socket.userId,
        });
      } catch (error) {
        logger.error('Error in typing-stop handler:', error);
      }
    });

    // ========================================
    // WebRTC Signaling
    // ========================================
    socket.on('offer', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        socket.to(data.to).emit('offer', {
          from: socket.id,
          to: data.to,
          offer: data.offer,
        });

        logger.debug(`Offer relayed from ${socket.id} to ${data.to}`);
      } catch (error) {
        logger.error('Error in offer handler:', error);
      }
    });

    socket.on('answer', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        socket.to(data.to).emit('answer', {
          from: socket.id,
          to: data.to,
          answer: data.answer,
        });

        logger.debug(`Answer relayed from ${socket.id} to ${data.to}`);
      } catch (error) {
        logger.error('Error in answer handler:', error);
      }
    });

    socket.on('ice-candidate', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        socket.to(data.to).emit('ice-candidate', {
          from: socket.id,
          to: data.to,
          candidate: data.candidate,
        });
      } catch (error) {
        logger.error('Error in ice-candidate handler:', error);
      }
    });

    // ========================================
    // Hand Raise
    // ========================================
    socket.on('hand-raised', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        io.to(roomId).emit('hand-raised', {
          userId: socket.userId,
          isHandRaised: data.isHandRaised,
        });

        logger.debug(
          `Hand raise event from ${socket.userName}: ${data.isHandRaised}`
        );
      } catch (error) {
        logger.error('Error in hand-raised handler:', error);
      }
    });

    // ========================================
    // Audio/Video Toggle
    // ========================================
    socket.on('toggle-audio', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        io.to(roomId).emit('toggle-audio', {
          userId: socket.userId,
          isMuted: data.isMuted,
        });
      } catch (error) {
        logger.error('Error in toggle-audio handler:', error);
      }
    });

    socket.on('toggle-video', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        io.to(roomId).emit('toggle-video', {
          userId: socket.userId,
          isCameraOff: data.isCameraOff,
        });
      } catch (error) {
        logger.error('Error in toggle-video handler:', error);
      }
    });

    // ========================================
    // Poll Management
    // ========================================
    socket.on('poll-create', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId || !data.question || !data.options) return;

        const pollId = uuidv4();
        const poll = {
          id: pollId,
          question: data.question,
          options: data.options.map((text: string) => ({
            id: uuidv4(),
            text,
            votes: [],
          })),
          createdBy: socket.userId,
          createdAt: Date.now(),
          isActive: true,
          totalVotes: 0,
        };

        // Save to database
        Poll.create({
          pollId,
          roomId,
          question: data.question,
          options: poll.options,
          createdBy: socket.userId,
          isActive: true,
          totalVotes: 0,
        }).catch((err) => logger.error('Error saving poll:', err));

        io.to(roomId).emit('poll-created', poll);
        logger.info(`Poll created in room ${roomId} by ${socket.userName}`);
      } catch (error) {
        logger.error('Error in poll-create handler:', error);
      }
    });

    socket.on('poll-vote', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId || !data.pollId || !data.optionId) return;

        io.to(roomId).emit('poll-voted', {
          pollId: data.pollId,
          optionId: data.optionId,
          userId: socket.userId,
        });

        logger.debug(`Vote recorded in poll ${data.pollId}`);
      } catch (error) {
        logger.error('Error in poll-vote handler:', error);
      }
    });

    socket.on('poll-close', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId || !data.pollId) return;

        io.to(roomId).emit('poll-closed', {
          pollId: data.pollId,
        });

        // Update database
        Poll.findOneAndUpdate(
          { pollId: data.pollId },
          { isActive: false },
          { new: true }
        ).catch((err) => logger.error('Error closing poll:', err));
      } catch (error) {
        logger.error('Error in poll-close handler:', error);
      }
    });

    // ========================================
    // Connection Quality
    // ========================================
    socket.on('connection-quality', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        io.to(roomId).emit('connection-quality', {
          userId: socket.userId,
          quality: data.quality,
        });
      } catch (error) {
        logger.error('Error in connection-quality handler:', error);
      }
    });

    // ========================================
    // Speaking Activity
    // ========================================
    socket.on('speaking-activity', (data: any) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return;

        socket.to(roomId).emit('speaking-activity', {
          userId: socket.userId,
          audioLevel: data.audioLevel || 0,
        });
      } catch (error) {
        logger.error('Error in speaking-activity handler:', error);
      }
    });

    // ========================================
    // Disconnect
    // ========================================
    socket.on('disconnect', async () => {
      try {
        const roomId = socket.roomId;
        const userId = socket.userId;
        const userName = socket.userName;

        if (roomId && userId) {
          const { participantCount } = roomManager.removeUserFromRoom(
            socket.id
          );

          // Update database
          try {
            const room = await Room.findOne({ roomId });
            if (room) {
              room.participants = room.participants.filter(
                (p) => p.socketId !== socket.id
              );
              if (room.participants.length === 0) {
                room.isActive = false;
              }
              await room.save();
            }
          } catch (dbError) {
            logger.error('Error updating room on disconnect:', dbError);
          }

          // Save system message
          try {
            await Message.create({
              roomId,
              userId,
              userName: userName || 'User',
              content: `${userName || 'User'} left the meeting`,
              type: 'system',
              systemType: 'leave',
            });
          } catch (dbError) {
            logger.error('Error saving disconnect message:', dbError);
          }

          // Emit to room
          io.to(roomId).emit('system-message', {
            id: uuidv4(),
            type: 'leave',
            userName: userName || 'User',
            timestamp: Date.now(),
          });

          io.to(roomId).emit('user-left', { userId });

          logger.info(
            `User ${userName} (${socket.id}) disconnected from room ${roomId}. Remaining: ${participantCount}`
          );
        }

        logger.info(`User disconnected: ${socket.id}`);
      } catch (error) {
        logger.error('Error in disconnect handler:', error);
      }
    });

    // ========================================
    // Connection Error Handler
    // ========================================
    socket.on('error', (error: any) => {
      logger.error(`Socket error from ${socket.id}:`, error);
    });
  });
}
