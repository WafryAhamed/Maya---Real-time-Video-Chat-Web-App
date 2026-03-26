// ============================================
// Maya Backend — Poll Model
// ============================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
  _id: mongoose.Types.ObjectId;
  pollId: string;
  roomId: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: string[];
  }>;
  createdBy: string;
  isActive: boolean;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const pollSchema = new Schema<IPoll>(
  {
    pollId: {
      type: String,
      required: true,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 12),
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      maxlength: 500,
    },
    options: [
      {
        id: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 200,
        },
        votes: [
          {
            type: String,
          },
        ],
        _id: false,
      },
    ],
    createdBy: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding polls by room
pollSchema.index({ roomId: 1, createdAt: -1 });

// Index for active polls
pollSchema.index({ roomId: 1, isActive: 1 });

// Auto-expire polls after 24 hours
pollSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400,
  }
);

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);
