import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongodb'
import { UserHistory } from '@/lib/models/UserHistory'
import { authOptions } from '@/lib/auth'

const createHistorySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  part: z.number().int().min(1).max(3),
  topic: z.string().optional(),
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    userAnswer: z.string().optional(),
    modelAnswer: z.string().optional(),
    evaluation: z.object({
      bandScore: z.number().min(1).max(9),
      criteria: z.object({
        fluencyCoherence: z.number().min(1).max(9),
        lexicalResource: z.number().min(1).max(9),
        grammaticalRange: z.number().min(1).max(9),
        pronunciation: z.number().min(1).max(9)
      }),
      feedback: z.string(),
      strengths: z.array(z.string()),
      improvements: z.array(z.string())
    }).optional(),
    timestamp: z.string().datetime().optional()
  })),
  overallScore: z.object({
    bandScore: z.number().min(1).max(9),
    criteria: z.object({
      fluencyCoherence: z.number().min(1).max(9),
      lexicalResource: z.number().min(1).max(9),
      grammaticalRange: z.number().min(1).max(9),
      pronunciation: z.number().min(1).max(9)
    })
  }).optional(),
  duration: z.number().min(0, 'Duration cannot be negative'),
  completedAt: z.string().datetime().optional()
})

// GET - Retrieve user history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const part = searchParams.get('part')
    const topic = searchParams.get('topic')

    await connectToDatabase()

    // Build query
    const query: Record<string, unknown> = { userId: session.user.id }
    if (part) query.part = parseInt(part)
    if (topic) query.topic = new RegExp(topic, 'i')

    // Get total count for pagination
    const total = await UserHistory.countDocuments(query)

    // Get paginated results
    const histories = await UserHistory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-userId')

    return NextResponse.json({
      histories: histories.map(history => ({
        id: history._id,
        sessionId: history.sessionId,
        part: history.part,
        topic: history.topic,
        questions: history.questions,
        overallScore: history.overallScore,
        duration: history.duration,
        completedAt: history.completedAt,
        createdAt: history.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('User history retrieval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new user history entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createHistorySchema.parse(body)

    await connectToDatabase()

    // Create new history entry
    const history = new UserHistory({
      ...validatedData,
      userId: session.user.id,
      questions: validatedData.questions.map(q => ({
        ...q,
        timestamp: q.timestamp ? new Date(q.timestamp) : new Date()
      })),
      completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : undefined
    })

    await history.save()

    return NextResponse.json({
      message: 'History entry created successfully',
      history: {
        id: history._id,
        sessionId: history.sessionId,
        part: history.part,
        topic: history.topic,
        questions: history.questions,
        overallScore: history.overallScore,
        duration: history.duration,
        completedAt: history.completedAt,
        createdAt: history.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('User history creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
