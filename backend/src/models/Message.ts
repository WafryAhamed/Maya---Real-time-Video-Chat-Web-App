// ============================================
// Maya Backend — Message Model
// ============================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  type: 'chat' | 'system';
  systemType?: 'join' | 'leave' | 'mute' | 'hand-raise';
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ['chat', 'system'],
      default: 'chat',
    },
    systemType: {
      type: String,
      enum: ['join', 'leave', 'mute', 'hand-raise'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding messages by room
messageSchema.index({ roomId: 1, createdAt: -1 });

// Auto-expire messages after 30 days
messageSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 2592000,
  }
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
