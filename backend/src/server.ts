// ============================================
// Maya Backend — Server Entry Point
// ============================================

import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app, { initializeDatabase, attachSocketIO, startCleanupScheduler } from './app';
import { logger } from './utils/logger';

// ========================================
// ENVIRONMENT VARIABLES
// ========================================

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========================================
// HTTP SERVER & SOCKET.IO
// ========================================

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6, // 1MB
});

// Attach Socket.IO handlers
attachSocketIO(io);

// ========================================
// STARTUP SEQUENCE
// ========================================

async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    // Start cleanup scheduler
    startCleanupScheduler();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`========================================`);
      logger.info(`🚀 Maya Backend Server Running`);
      logger.info(`📍 http://localhost:${PORT}`);
      logger.info(`🔌 Socket.IO - ${CLIENT_URL}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`========================================`);
    });

    // ========================================
    // GRACEFUL SHUTDOWN
    // ========================================

    const shutdown = async (signal: string) => {
      logger.info(`\n⏱️  ${signal} received. Shutting down gracefully...`);

      httpServer.close(async () => {
        logger.info('✓ HTTP server closed');

        // Close database connection
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        logger.info('✓ Database disconnected');

        logger.info('✓ Server shutdown complete');
        process.exit(0);
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('!!! Force shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ========================================
    // ERROR HANDLING
    // ========================================

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
