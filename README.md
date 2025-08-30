# IELTS Speaking Partner

An AI-powered IELTS speaking practice application with comprehensive user authentication, model answer caching, and progress tracking.

## Features

### Core Features
- **AI-Powered Speaking Practice**: Practice IELTS speaking tests (Parts 1, 2, and 3) with OpenAI's advanced voice models
- **Real-time Voice Interaction**: Natural conversation flow with AI examiner
- **Authentic Test Structure**: Follows official IELTS speaking test format and timing
- **Instant Feedback**: Get detailed feedback on pronunciation, fluency, and content

### Authentication & User Management
- **Secure User Registration**: Create accounts with email and password
- **JWT-based Authentication**: Secure session management with NextAuth.js
- **Protected Routes**: Middleware protection for authenticated areas
- **Session Persistence**: 30-day session duration with automatic renewal

### Database & Caching System
- **MongoDB Integration**: Robust data storage with Mongoose ODM
- **Model Answer Caching**: Intelligent caching system to reduce OpenAI API costs
- **User History Tracking**: Complete practice session history with detailed analytics
- **Performance Optimization**: Indexed queries for fast data retrieval

### Progress Tracking
- **Session History**: Track all practice sessions with timestamps
- **Performance Analytics**: Band scores and detailed criteria breakdown
- **Question Bank**: Cached questions and model answers for reuse
- **Usage Statistics**: Monitor API usage and cost optimization

## Technology Stack

- **Frontend**: Next.js 15.5.0, React 19.1.0, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT strategy
- **AI Integration**: OpenAI API with advanced voice models
- **Validation**: Zod for runtime type checking
- **Security**: bcryptjs for password hashing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ielts-speaking-partner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ielts-speaking-partner
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `ielts-speaking-partner`
   - The application will automatically create the required collections

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  lastLogin?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### ModelAnswer Model
```typescript
{
  questionHash: string (unique)
  question: string
  part: 1 | 2 | 3
  topic?: string
  modelAnswer: string
  bandScore: number (1-9)
  criteria: {
    fluencyCoherence: number (1-9)
    lexicalResource: number (1-9)
    grammaticalRange: number (1-9)
    pronunciation: number (1-9)
  }
  usageCount: number
  createdAt: Date
  updatedAt: Date
}
```

### UserHistory Model
```typescript
{
  userId: ObjectId
  sessionId: string
  part: 1 | 2 | 3
  topic?: string
  questions: Array<{
    question: string
    userAnswer?: string
    modelAnswer?: string
    evaluation?: {
      bandScore: number (1-9)
      criteria: object
      feedback: string
      strengths: string[]
      improvements: string[]
    }
    timestamp: Date
  }>
  overallScore?: {
    bandScore: number (1-9)
    criteria: object
  }
  duration: number (seconds)
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `GET /api/auth/[...nextauth]` - Session management

### Model Answers
- `GET /api/model-answers` - Search cached model answers
- `POST /api/model-answers` - Cache new model answers

### User History
- `GET /api/user-history` - Retrieve user practice history
- `POST /api/user-history` - Save practice session

## Usage

### Getting Started
1. **Create an Account**: Register with your email and password
2. **Sign In**: Access your personalized dashboard
3. **Provide API Key**: Enter your OpenAI API key for voice interactions
4. **Choose Test Part**: Select from IELTS Parts 1, 2, or 3
5. **Start Practice**: Begin your speaking practice session

### Practice Flow
1. **Question Generation**: AI generates authentic IELTS questions
2. **Voice Interaction**: Speak naturally with the AI examiner
3. **Real-time Feedback**: Receive instant pronunciation and fluency feedback
4. **Session Recording**: All sessions are automatically saved to your history
5. **Progress Tracking**: View detailed analytics and improvement suggestions

### Model Answer Caching
- Questions are automatically hashed and cached to reduce API costs
- Cached answers are reused for identical questions
- Usage statistics help optimize API consumption
- High-quality model answers improve over time

## Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure session management
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Built-in protection against abuse

## Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard
├── components/            # React components
├── contexts/              # React contexts
├── lib/                   # Utility libraries
│   ├── models/           # Database models
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   └── openai.ts         # OpenAI integration
├── middleware.ts          # Route protection
└── types/                # TypeScript definitions
```

### Key Components
- **SessionProvider**: NextAuth session management
- **TestSession**: Main practice interface
- **ErrorContext**: Global error handling
- **Middleware**: Route protection and authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on the GitHub repository.
