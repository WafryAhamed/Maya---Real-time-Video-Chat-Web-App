// ============================================
// Maya Backend — Message Controller
// ============================================

import { Request, Response } from 'express';
import { Message } from '../models';
import { logger } from '../utils/logger';

/**
 * Get messages for a room
 */
export async function getRoomMessages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const skip = Math.max(parseInt(req.query.skip as string) || 0, 0);

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const [messages, total] = await Promise.all([
      Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Message.countDocuments({ roomId }),
    ]);

    res.json({
      messages: messages.reverse(),
      total,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    logger.error('Error getting room messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}

/**
 * Get system messages for a room
 */
export async function getRoomSystemMessages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const messages = await Message.find({
      roomId,
      type: 'system',
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    logger.error('Error getting system messages:', error);
    res.status(500).json({ error: 'Failed to get system messages' });
  }
}

/**
 * Search messages in a room
 */
export async function searchMessages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { roomId } = req.params;
    const { query } = req.query;

    if (!roomId || !query) {
      res
        .status(400)
        .json({ error: 'roomId and query are required' });
      return;
    }

    const messages = await Message.find({
      roomId,
      content: { $regex: query as string, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    logger.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
}

/**
 * Get message stats for a room
 */
export async function getMessageStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    const [totalMessages, totalUsers, totalSystemMessages] = await Promise.all(
      [
        Message.countDocuments({ roomId, type: 'chat' }),
        Message.distinct('userId', { roomId }),
        Message.countDocuments({ roomId, type: 'system' }),
      ]
    );

    res.json({
      totalMessages,
      totalUsers: totalUsers.length,
      totalSystemMessages,
      avgMessagesPerUser:
        totalUsers.length > 0 ? totalMessages / totalUsers.length : 0,
    });
  } catch (error) {
    logger.error('Error getting message stats:', error);
    res.status(500).json({ error: 'Failed to get message stats' });
  }
}
