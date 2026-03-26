// ============================================
// Maya Backend — Room Controller
// ============================================

import { Request, Response } from 'express';
import { Room, Message, Poll } from '../models';
import { logger } from '../utils/logger';

/**
 * Create a new room
 */
export async function createRoom(req: Request, res: Response): Promise<void> {
  try {
    const { roomId, name } = req.body;

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    let room = await Room.findOne({ roomId });

    if (room) {
      res.status(200).json(room);
      return;
    }

    room = new Room({
      roomId,
      name: name || `Meeting ${roomId}`,
      participants: [],
      isActive: true,
    });

    await room.save();
    logger.info(`Room created: ${roomId}`);

    res.status(201).json(room);
  } catch (error) {
    logger.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}

/**
 * Get room details
 */
export async function getRoom(req: Request, res: Response): Promise<void> {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const room = await Room.findOne({ roomId }).populate('participants.userId');

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json(room);
  } catch (error) {
    logger.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
}

/**
 * Get room history (messages + polls)
 */
export async function getRoomHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const [messages, polls] = await Promise.all([
      Message.find({ roomId }).sort({ createdAt: -1 }).limit(limit),
      Poll.find({ roomId }).sort({ createdAt: -1 }).limit(20),
    ]);

    res.json({
      messages: messages.reverse(),
      polls: polls.reverse(),
    });
  } catch (error) {
    logger.error('Error getting room history:', error);
    res.status(500).json({ error: 'Failed to get room history' });
  }
}

/**
 * End/close a room
 */
export async function closeRoom(req: Request, res: Response): Promise<void> {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const room = await Room.findOneAndUpdate(
      { roomId },
      { isActive: false, participants: [] },
      { new: true }
    );

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    logger.info(`Room closed: ${roomId}`);
    res.json(room);
  } catch (error) {
    logger.error('Error closing room:', error);
    res.status(500).json({ error: 'Failed to close room' });
  }
}

/**
 * Get active rooms
 */
export async function getActiveRooms(req: Request, res: Response): Promise<void> {
  try {
    const rooms = await Room.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(rooms);
  } catch (error) {
    logger.error('Error getting active rooms:', error);
    res.status(500).json({ error: 'Failed to get active rooms' });
  }
}
