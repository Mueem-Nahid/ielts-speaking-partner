import mongoose, { Document, Schema } from 'mongoose'

export interface IModelAnswer extends Document {
  _id: mongoose.Types.ObjectId
  questionHash: string // Hash of the question for quick lookup
  question: string
  part: 1 | 2 | 3 // IELTS speaking parts
  topic?: string
  modelAnswer: string
  bandScore: number
  criteria: {
    fluencyCoherence: number
    lexicalResource: number
    grammaticalRange: number
    pronunciation: number
  }
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

const ModelAnswerSchema = new Schema<IModelAnswer>({
  questionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
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
  modelAnswer: {
    type: String,
    required: [true, 'Model answer is required'],
    trim: true
  },
  bandScore: {
    type: Number,
    required: [true, 'Band score is required'],
    min: [1, 'Band score must be at least 1'],
    max: [9, 'Band score cannot exceed 9']
  },
  criteria: {
    fluencyCoherence: {
      type: Number,
      required: true,
      min: [1, 'Score must be at least 1'],
      max: [9, 'Score cannot exceed 9']
    },
    lexicalResource: {
      type: Number,
      required: true,
      min: [1, 'Score must be at least 1'],
      max: [9, 'Score cannot exceed 9']
    },
    grammaticalRange: {
      type: Number,
      required: true,
      min: [1, 'Score must be at least 1'],
      max: [9, 'Score cannot exceed 9']
    },
    pronunciation: {
      type: Number,
      required: true,
      min: [1, 'Score must be at least 1'],
      max: [9, 'Score cannot exceed 9']
    }
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
ModelAnswerSchema.index({ part: 1, topic: 1 })
ModelAnswerSchema.index({ bandScore: -1 })
ModelAnswerSchema.index({ usageCount: -1 })
ModelAnswerSchema.index({ createdAt: -1 })

export const ModelAnswer = mongoose.models.ModelAnswer || mongoose.model<IModelAnswer>('ModelAnswer', ModelAnswerSchema)
