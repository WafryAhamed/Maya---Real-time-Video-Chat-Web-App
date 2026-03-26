// ============================================
// Maya Backend — Database Configuration
// ============================================

import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maya';

/**
 * Initialize MongoDB connection
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('✓ MongoDB connected successfully');
  } catch (error) {
    logger.error('✗ MongoDB connection failed:', error);
    throw error; // Re-throw to allow server to handle gracefully
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('✓ MongoDB disconnected');
  } catch (error) {
    logger.error('✗ MongoDB disconnection failed:', error);
  }
}

/**
 * Get database health status
 */
export function getDatabaseStatus(): boolean {
  return mongoose.connection.readyState === 1;
}

export default mongoose;
