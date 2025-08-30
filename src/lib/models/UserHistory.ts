import mongoose, { Document, Schema } from 'mongoose'

export interface IUserHistory extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  sessionId: string
  part: 1 | 2 | 3
  topic?: string
  questions: Array<{
    question: string
    userAnswer?: string
    modelAnswer?: string
    evaluation?: {
      bandScore: number
      criteria: {
        fluencyCoherence: number
        lexicalResource: number
        grammaticalRange: number
        pronunciation: number
      }
      feedback: string
      strengths: string[]
      improvements: string[]
    }
    timestamp: Date
  }>
  overallScore?: {
    bandScore: number
    criteria: {
      fluencyCoherence: number
      lexicalResource: number
      grammaticalRange: number
      pronunciation: number
    }
  }
  duration: number // in seconds
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserHistorySchema = new Schema<IUserHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    index: true
  },
  part: {
    type: Number,
    required: [true, 'IELTS part is required'],
    enum: [1, 2, 3],
    index: true
  },
  topic: {
    type: String,
    trim: true,
    index: true
  },
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    userAnswer: {
      type: String,
      trim: true
    },
    modelAnswer: {
      type: String,
      trim: true
    },
    evaluation: {
      bandScore: {
        type: Number,
        min: [1, 'Band score must be at least 1'],
        max: [9, 'Band score cannot exceed 9']
      },
      criteria: {
        fluencyCoherence: {
          type: Number,
          min: [1, 'Score must be at least 1'],
          max: [9, 'Score cannot exceed 9']
        },
        lexicalResource: {
          type: Number,
          min: [1, 'Score must be at least 1'],
          max: [9, 'Score cannot exceed 9']
        },
        grammaticalRange: {
          type: Number,
          min: [1, 'Score must be at least 1'],
          max: [9, 'Score cannot exceed 9']
        },
        pronunciation: {
          type: Number,
          min: [1, 'Score must be at least 1'],
          max: [9, 'Score cannot exceed 9']
        }
      },
      feedback: {
        type: String,
        trim: true
      },
      strengths: [{
        type: String,
        trim: true
      }],
      improvements: [{
        type: String,
        trim: true
      }]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  overallScore: {
    bandScore: {
      type: Number,
      min: [1, 'Band score must be at least 1'],
      max: [9, 'Band score cannot exceed 9']
    },
    criteria: {
      fluencyCoherence: {
        type: Number,
        min: [1, 'Score must be at least 1'],
        max: [9, 'Score cannot exceed 9']
      },
      lexicalResource: {
        type: Number,
        min: [1, 'Score must be at least 1'],
        max: [9, 'Score cannot exceed 9']
      },
      grammaticalRange: {
        type: Number,
        min: [1, 'Score must be at least 1'],
        max: [9, 'Score cannot exceed 9']
      },
      pronunciation: {
        type: Number,
        min: [1, 'Score must be at least 1'],
        max: [9, 'Score cannot exceed 9']
      }
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration cannot be negative']
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
UserHistorySchema.index({ userId: 1, createdAt: -1 })
UserHistorySchema.index({ userId: 1, part: 1 })
UserHistorySchema.index({ sessionId: 1 })
UserHistorySchema.index({ completedAt: -1 })

export const UserHistory = mongoose.models.UserHistory || mongoose.model<IUserHistory>('UserHistory', UserHistorySchema)
