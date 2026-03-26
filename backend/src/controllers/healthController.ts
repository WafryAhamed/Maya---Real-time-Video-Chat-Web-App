// ============================================
// Maya Backend — Health Controller
// ============================================

import { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/db';
import { roomManager } from '../utils/room-manager';

/**
 * Health check endpoint
 */
export function health(req: Request, res: Response): void {
  const dbStatus = getDatabaseStatus();
  const stats = roomManager.getStats();

  res.json({
    status: dbStatus ? 'healthy' : 'unhealthy',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ...stats,
  });
}

/**
 * System stats endpoint
 */
export function stats(req: Request, res: Response): void {
  const stats = roomManager.getStats();

  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    ...stats,
  });
}
