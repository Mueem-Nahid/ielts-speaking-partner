import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import crypto from 'crypto'
import { connectToDatabase } from '@/lib/mongodb'
import { ModelAnswer } from '@/lib/models/ModelAnswer'
import { authOptions } from '@/lib/auth'

const modelAnswerSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  part: z.number().int().min(1).max(3),
  topic: z.string().optional(),
  modelAnswer: z.string().min(1, 'Model answer is required'),
  bandScore: z.number().min(1).max(9),
  criteria: z.object({
    fluencyCoherence: z.number().min(1).max(9),
    lexicalResource: z.number().min(1).max(9),
    grammaticalRange: z.number().min(1).max(9),
    pronunciation: z.number().min(1).max(9)
  })
})

const searchSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  part: z.number().int().min(1).max(3).optional(),
  topic: z.string().optional()
})

// GET - Search for cached model answers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const question = searchParams.get('question')
    const part = searchParams.get('part')
    const topic = searchParams.get('topic')

    if (!question) {
      return NextResponse.json({ error: 'Question parameter is required' }, { status: 400 })
    }

    // Create hash for exact question match
    const questionHash = crypto.createHash('sha256').update(question.toLowerCase().trim()).digest('hex')

    await connectToDatabase()

    // Try exact match first
    const modelAnswer = await ModelAnswer.findOne({ questionHash })

    if (modelAnswer) {
      // Increment usage count
      await ModelAnswer.findByIdAndUpdate(modelAnswer._id, { $inc: { usageCount: 1 } })
      
      return NextResponse.json({
        found: true,
        modelAnswer: {
          id: modelAnswer._id,
          question: modelAnswer.question,
          part: modelAnswer.part,
          topic: modelAnswer.topic,
          modelAnswer: modelAnswer.modelAnswer,
          bandScore: modelAnswer.bandScore,
          criteria: modelAnswer.criteria,
          usageCount: modelAnswer.usageCount + 1
        }
      })
    }

    // If no exact match, try similar questions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchQuery: any = {}
    if (part) searchQuery.part = parseInt(part)
    if (topic) searchQuery.topic = new RegExp(topic, 'i')

    const similarAnswers = await ModelAnswer.find(searchQuery)
      .sort({ usageCount: -1, bandScore: -1 })
      .limit(5)
      .select('-questionHash')

    return NextResponse.json({
      found: false,
      similarAnswers: similarAnswers.map(answer => ({
        id: answer._id,
        question: answer.question,
        part: answer.part,
        topic: answer.topic,
        modelAnswer: answer.modelAnswer,
        bandScore: answer.bandScore,
        criteria: answer.criteria,
        usageCount: answer.usageCount
      }))
    })

  } catch (error) {
    console.error('Model answer search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Cache a new model answer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = modelAnswerSchema.parse(body)

    // Create hash for the question
    const questionHash = crypto.createHash('sha256')
      .update(validatedData.question.toLowerCase().trim())
      .digest('hex')

    await connectToDatabase()

    // Check if already exists
    const existing = await ModelAnswer.findOne({ questionHash })
    if (existing) {
      return NextResponse.json({
        message: 'Model answer already exists',
        modelAnswer: {
          id: existing._id,
          question: existing.question,
          part: existing.part,
          topic: existing.topic,
          modelAnswer: existing.modelAnswer,
          bandScore: existing.bandScore,
          criteria: existing.criteria,
          usageCount: existing.usageCount
        }
      })
    }

    // Create new model answer
    const modelAnswer = new ModelAnswer({
      ...validatedData,
      questionHash,
      usageCount: 1
    })

    await modelAnswer.save()

    return NextResponse.json({
      message: 'Model answer cached successfully',
      modelAnswer: {
        id: modelAnswer._id,
        question: modelAnswer.question,
        part: modelAnswer.part,
        topic: modelAnswer.topic,
        modelAnswer: modelAnswer.modelAnswer,
        bandScore: modelAnswer.bandScore,
        criteria: modelAnswer.criteria,
        usageCount: modelAnswer.usageCount
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Model answer caching error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
