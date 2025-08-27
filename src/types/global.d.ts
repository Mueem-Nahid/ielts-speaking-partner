import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
  }

  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
    }
  }
}

export {}
