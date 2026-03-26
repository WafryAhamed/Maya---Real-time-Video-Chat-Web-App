// ============================================
// Maya Backend — Room Model
// ============================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: string;
  name: string;
  participants: Array<{
    socketId: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
    joinedAt: Date;
    role: 'host' | 'participant';
  }>;
  createdBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      default: 'Meeting Room',
      trim: true,
    },
    participants: [
      {
        socketId: {
          type: String,
          required: true,
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        userName: {
          type: String,
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ['host', 'participant'],
          default: 'participant',
        },
        _id: false,
      },
    ],
    createdBy: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active rooms
roomSchema.index({ isActive: 1, createdAt: -1 });

// Auto-expire inactive rooms after 24 hours
roomSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400,
    partialFilterExpression: { isActive: false },
  }
);

export const Room = mongoose.model<IRoom>('Room', roomSchema);
