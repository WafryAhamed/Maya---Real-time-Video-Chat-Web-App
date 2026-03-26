// ============================================
// Maya Backend — Express App Configuration
// ============================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db';
import { initializeSocketHandlers } from './sockets/socketHandler';
import { logger } from './utils/logger';
import { roomManager } from './utils/room-manager';

// Routes
import roomRoutes from './routes/roomRoutes';
import messageRoutes from './routes/messageRoutes';
import healthRoutes from './routes/healthRoutes';

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ========================================
// DATABASE INITIALIZATION
// ========================================
export async function initializeDatabase(): Promise<void> {
  await connectDatabase();
}

// ========================================
// ROUTES
// ========================================

// Health check
app.use('/api/health', healthRoutes);

// Rooms API
app.use('/api/rooms', roomRoutes);

// Messages API
app.use('/api/messages', messageRoutes);

// Root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Maya Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`Not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ========================================
// SOCKET.IO INITIALIZATION
// ========================================
export function attachSocketIO(io: any): void {
  initializeSocketHandlers(io);
  logger.info('✓ Socket.IO handlers initialized');
}

// ========================================
// CLEANUP SCHEDULER
// ========================================
export function startCleanupScheduler(): void {
  // Run cleanup every 30 minutes
  setInterval(() => {
    roomManager.cleanupInactiveRooms();
  }, 30 * 60 * 1000);

  logger.info('✓ Cleanup scheduler started');
}

export default app;
