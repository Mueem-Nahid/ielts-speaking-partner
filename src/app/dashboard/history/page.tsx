'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface HistoryEntry {
  id: string
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
    timestamp: string
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
  duration: number
  completedAt?: string
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PracticeHistory() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [histories, setHistories] = useState<HistoryEntry[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPart, setSelectedPart] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchHistory()
  }, [session, status, router, pagination.page, selectedPart])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (selectedPart) {
        params.append('part', selectedPart)
      }

      const response = await fetch(`/api/user-history?${params}`)
      const data = await response.json()

      if (response.ok) {
        setHistories(data.histories)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Failed to fetch history')
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      setError('Failed to fetch practice history')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBandScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6.5) return 'text-blue-600 bg-blue-100'
    if (score >= 5.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getPartColor = (part: number) => {
    switch (part) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-orange-100 text-orange-800'
      case 3: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice history...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Practice History
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">{session.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Part
                </label>
                <select
                  value={selectedPart}
                  onChange={(e) => {
                    setSelectedPart(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Parts</option>
                  <option value="1">Part 1</option>
                  <option value="2">Part 2</option>
                  <option value="3">Part 3</option>
                </select>
              </div>
              <div className="flex-1"></div>
              <div className="text-sm text-gray-600">
                Total Sessions: {pagination.total}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {histories.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice History</h3>
              <p className="text-gray-600 mb-6">You haven&apos;t completed any practice sessions yet.</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Your First Practice
              </Link>
            </div>
          ) : (
            <>
              {/* History List */}
              <div className="space-y-4">
                {histories.map((history) => (
                  <div key={history.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPartColor(history.part)}`}>
                          Part {history.part}
                        </span>
                        {history.topic && (
                          <span className="text-sm text-gray-600">
                            Topic: {history.topic}
                          </span>
                        )}
                        {history.overallScore && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBandScoreColor(history.overallScore.bandScore)}`}>
                            Band {history.overallScore.bandScore}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(history.createdAt)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Duration:</span>
                        <span className="ml-2 text-sm text-gray-600">{formatDuration(history.duration)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Questions:</span>
                        <span className="ml-2 text-sm text-gray-600">{history.questions.length}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 text-sm ${history.completedAt ? 'text-green-600' : 'text-yellow-600'}`}>
                          {history.completedAt ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    {/* Questions and Answers */}
                    {history.questions.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Questions & Answers:</h4>
                        <div className="space-y-4">
                          {history.questions.map((q, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-gray-800 mb-2">Question {index + 1}:</h5>
                                <p className="text-sm text-gray-700 mb-3">{q.question}</p>
                              </div>
                              
                              {q.userAnswer && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="text-xs font-medium text-blue-800 mb-1">Your Answer:</h6>
                                    <span className={`text-xs px-2 py-1 rounded ${getBandScoreColor(q?.evaluation?.bandScore ?? 0)}`}>
                                      {q?.evaluation?.bandScore}
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">{q.userAnswer}</p>
                                </div>
                              )}
                              
                              {q.modelAnswer && (
                                <div className="mb-3">
                                  <h6 className="text-xs font-medium text-green-800 mb-1">Improved Answer:</h6>
                                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded">{q.modelAnswer}</p>
                                </div>
                              )}                                                 
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {history.overallScore && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Scores:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Fluency & Coherence:</span>
                            <span className="ml-2 font-medium">{history.overallScore.criteria.fluencyCoherence}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lexical Resource:</span>
                            <span className="ml-2 font-medium">{history.overallScore.criteria.lexicalResource}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Grammar:</span>
                            <span className="ml-2 font-medium">{history.overallScore.criteria.grammaticalRange}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Pronunciation:</span>
                            <span className="ml-2 font-medium">{history.overallScore.criteria.pronunciation}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
