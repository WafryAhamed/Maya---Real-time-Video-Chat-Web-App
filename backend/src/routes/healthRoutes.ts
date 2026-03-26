// ============================================
// Maya Backend — Health Routes
// ============================================

import { Router } from 'express';
import * as healthController from '../controllers/healthController';

const router = Router();

// Health check
router.get('/', healthController.health);

// System stats
router.get('/stats', healthController.stats);

export default router;
