// ============================================
// Maya Backend — Message Routes
// ============================================

import { Router } from 'express';
import * as messageController from '../controllers/messageController';

const router = Router();

// Get messages for a room
router.get('/:roomId', messageController.getRoomMessages);

// Get system messages for a room
router.get('/:roomId/system', messageController.getRoomSystemMessages);

// Search messages in a room
router.get('/:roomId/search', messageController.searchMessages);

// Get message stats for a room
router.get('/:roomId/stats', messageController.getMessageStats);

export default router;
