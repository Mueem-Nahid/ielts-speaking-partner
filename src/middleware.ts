import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect API routes that require authentication
        if (req.nextUrl.pathname.startsWith('/api/model-answers')) {
          return !!token
        }
        if (req.nextUrl.pathname.startsWith('/api/user-history')) {
          return !!token
        }
        
        // Protect dashboard and other authenticated pages
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/api/model-answers/:path*',
    '/api/user-history/:path*',
    '/dashboard/:path*'
  ]
}
