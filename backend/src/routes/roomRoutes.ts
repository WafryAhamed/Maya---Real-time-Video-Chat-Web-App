// ============================================
// Maya Backend — Room Routes
// ============================================

import { Router } from 'express';
import * as roomController from '../controllers/roomController';

const router = Router();

// Create or get a room
router.post('/', roomController.createRoom);

// Get room details
router.get('/:roomId', roomController.getRoom);

// Get room history (messages + polls)
router.get('/:roomId/history', roomController.getRoomHistory);

// Close a room
router.post('/:roomId/close', roomController.closeRoom);

// Get active rooms
router.get('/', roomController.getActiveRooms);

export default router;
