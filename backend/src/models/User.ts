// ============================================
// Maya Backend — User Model
// ============================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  socketId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  currentRoom?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    socketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    isCameraOff: {
      type: Boolean,
      default: false,
    },
    isScreenSharing: {
      type: Boolean,
      default: false,
    },
    currentRoom: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding users by room
userSchema.index({ currentRoom: 1 });

// Clean up old records (older than 24 hours)
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
