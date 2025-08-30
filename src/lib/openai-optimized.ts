import OpenAI from 'openai';
import part1Questions from '@/data/part_1_questions.json';
import part2Questions from '@/data/part_2_questions.json';

// Cache for storing recent API responses to avoid duplicate calls
interface CacheEntry {
  data: unknown;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: unknown, expiresIn: number = this.DEFAULT_EXPIRY) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

export class OptimizedOpenAIService {
  private client: OpenAI;
  private apiKey: string;
  private cache = new APICache();
  
  // Cost optimization settings
  private readonly MODELS = {
    CHEAP: 'gpt-3.5-turbo',      // $0.0015/1K input, $0.002/1K output
    STANDARD: 'gpt-4o-mini',      // $0.15/1M input, $0.6/1M output  
    PREMIUM: 'gpt-4'              // $30/1M input, $60/1M output
  };

  private readonly TTS_MODELS = {
    CHEAP: 'tts-1',               // $15/1M characters
    PREMIUM: 'tts-1-hd'           // $30/1M characters
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  // Validate API key with minimal cost
  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    const cacheKey = `validate_${this.apiKey.slice(-8)}`;
    const cached = this.cache.get(cacheKey) as { isValid: boolean; error?: string } | null;
    if (cached) return cached;

    try {
      // Use the cheapest possible validation method
      await this.client.models.list();
      const result = { isValid: true };
      this.cache.set(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('API key validation failed:', error);
      
      const result = this.getValidationError(error);
      // Don't cache errors for too long
      this.cache.set(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
      return result;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getValidationError(error: any): { isValid: false; error: string } {
    if (error?.status === 401) {
      return { isValid: false, error: 'Invalid API key. Please check your OpenAI API key and try again.' };
    } else if (error?.status === 429) {
      return { isValid: false, error: 'API rate limit exceeded. Please try again later or check your OpenAI account.' };
    } else if (error?.status === 403) {
      return { isValid: false, error: 'API access forbidden. Please ensure your API key has the required permissions.' };
    } else if (error?.code === 'insufficient_quota') {
      return { isValid: false, error: 'Insufficient API quota. Please check your OpenAI account billing.' };
    } else {
      return { isValid: false, error: 'Failed to connect to OpenAI. Please check your internet connection and try again.' };
    }
  }

  // Optimized question generation with caching and cheaper models
  async generateQuestion(part: number, questionNumber: number, previousResponses?: string[]): Promise<string> {
    // Create cache key based on part and context
    const contextKey = previousResponses?.join('|') || '';
    const cacheKey = `question_${part}_${contextKey.slice(0, 50)}`;
    
    const cached = this.cache.get(cacheKey) as string | null;
    if (cached) return cached;

    const prompts = {
      1: this.getPart1Prompt(),
      2: this.getPart2Prompt(),
      3: this.getPart3Prompt(questionNumber, previousResponses)
    };

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODELS.CHEAP, // Use cheapest model for question generation
        messages: [
          {
            role: 'system',
            content: 'You are an IELTS examiner. Generate authentic questions. Be concise.'
          },
          {
            role: 'user',
            content: prompts[part as keyof typeof prompts]
          }
        ],
        max_tokens: 80, // Reduced from 150 to save costs
        temperature: 0.7
      });

      const question = response.choices[0]?.message?.content || this.getFallbackQuestion(part, questionNumber);
      
      // Cache for 30 minutes to avoid regenerating similar questions
      this.cache.set(cacheKey, question, 30 * 60 * 1000);
      
      return question;
    } catch (error) {
      this.handleApiError(error, 'generate question');
    }
  }

  // Optimized evaluation with smart caching
  async evaluateResponse(response: string, part: number): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    // Cache based on response hash to avoid re-evaluating identical responses
    const responseHash = this.hashString(response);
    const cacheKey = `eval_${part}_${responseHash}`;
    
    const cached = this.cache.get(cacheKey) as { score: number; feedback: string; suggestions: string[]; } | null;
    if (cached) return cached;

    try {
      const evaluation = await this.client.chat.completions.create({
        model: this.MODELS.STANDARD, // Use mid-tier model for evaluation
        messages: [
          {
            role: 'system',
            content: `IELTS examiner. Evaluate Part ${part} response. Return JSON:
            {"score": number, "feedback": "brief feedback", "suggestions": ["tip1", "tip2", "tip3"]}`
          },
          {
            role: 'user',
            content: `Response: "${response.slice(0, 500)}"` // Limit input length
          }
        ],
        max_tokens: 200, // Reduced from 300
        temperature: 0.2 // Lower temperature for consistent evaluation
      });

      const content = evaluation.choices[0]?.message?.content;
      let result;
      
      if (content) {
        try {
          result = JSON.parse(content);
        } catch {
          result = this.getFallbackEvaluation();
        }
      } else {
        result = this.getFallbackEvaluation();
      }

      // Cache evaluation for 1 hour
      this.cache.set(cacheKey, result, 60 * 60 * 1000);
      return result;
    } catch (error) {
      this.handleApiError(error, 'evaluate response');
    }
  }

  // Optimized model answer generation
  async generateModelAnswer(question: string, part: number, userResponse?: string): Promise<string> {
    const inputKey = userResponse ? this.hashString(userResponse) : this.hashString(question);
    const cacheKey = `model_${part}_${inputKey}`;
    
    const cached = this.cache.get(cacheKey) as string | null;
    if (cached) return cached;

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODELS.STANDARD, // Use mid-tier model
        messages: [
          {
            role: 'system',
            content: `You are an IELTS speaking expert. ${userResponse ? 'Improve user\'s response' : 'Generate model answer'} to band 7-7.5 level.

            ${userResponse ? `
            TASK: Improve user's response keeping personal details and core content.
            - Fix grammar and awkward phrasing
            - Enhance vocabulary appropriately
            - Improve sentence structure and flow
            - Add natural hesitations for authenticity
            - Keep personal information unchanged
            ` : `
            TASK: Generate new model answer.
            `}

            CRITICAL: Follow these EXACT structures:

            **Part 1 (30-40 sec, band 7-7.5):**
            Answer → Reason → Example

            **Part 2 (2 mins, band 7-7.5):**
            Intro → Details → Feelings → Reflection

            **Part 3 (30-50 sec, band 7-7.5):**
            Point → Explain → Example

            IMPORTANT: Keep language SIMPLE and ACCESSIBLE. Use everyday vocabulary, mostly simple sentences, and sound like a real person having a normal conversation. Don't use too many difficult words. Add natural hesitations (um, well, you know) for authenticity.`
          },
          {
            role: 'user',
            content: userResponse 
              ? `Q: "${question.slice(0, 200)}"\nUser: "${userResponse.slice(0, 300)}"\n\nImprove following Part ${part} structure.`
              : `Generate Part ${part} answer for: "${question.slice(0, 200)}" following exact structure.`
          }
        ],
        max_tokens: part === 2 ? 300 : 150, // Reduced token limits
        temperature: 0.7
      });

      const answer = response.choices[0]?.message?.content || this.getFallbackModelAnswer(part);
      
      // Cache for 2 hours
      this.cache.set(cacheKey, answer, 2 * 60 * 60 * 1000);
      
      return answer;
    } catch (error) {
      this.handleApiError(error, 'generate model answer');
    }
  }

  // Optimized TTS with caching
  async textToSpeech(text: string): Promise<ArrayBuffer> {
    const textHash = this.hashString(text);
    const cacheKey = `tts_${textHash}`;
    
    const cached = this.cache.get(cacheKey) as ArrayBuffer | null;
    if (cached) return cached;

    try {
      const response = await this.client.audio.speech.create({
        model: this.TTS_MODELS.PREMIUM, // Use HD model for better quality
        voice: 'nova', // More natural female voice
        input: text.slice(0, 1000), // Limit text length to control costs
        speed: 0.9, // Natural pace
        response_format: 'mp3' // Better compression and quality
      });

      const audioBuffer = await response.arrayBuffer();
      
      // Cache audio for 1 hour
      this.cache.set(cacheKey, audioBuffer, 60 * 60 * 1000);
      
      return audioBuffer;
    } catch (error) {
      this.handleApiError(error, 'convert text to speech');
    }
  }

  // STT remains the same as it's already optimized
  async speechToText(audioBlob: Blob): Promise<string> {
    try {
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      
      const response = await this.client.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en'
      });

      return response.text;
    } catch (error) {
      this.handleApiError(error, 'convert speech to text');
    }
  }

  // Utility methods
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleApiError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    
    if (error?.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
    } else if (error?.status === 429) {
      throw new Error('API rate limit exceeded. Please try again in a few moments.');
    } else if (error?.status === 403) {
      throw new Error('API access forbidden. Please check your API key permissions.');
    } else if (error?.code === 'insufficient_quota') {
      throw new Error('Insufficient API quota. Please check your OpenAI account billing.');
    } else if (error?.message?.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(`Failed to ${operation}. Please try again.`);
    }
  }

  // Cost monitoring methods
  getCacheStats() {
    return {
      size: this.cache['cache'].size,
      hitRate: 'Implement hit rate tracking if needed'
    };
  }

  clearCache() {
    this.cache.clear();
  }

  // Existing private methods (unchanged for compatibility)
  private getPart1Prompt(): string {
    const questions = part1Questions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];
    return `Generate a Part 1 IELTS question similar to: "${selectedQuestion}". Keep it personal and concise.`;
  }

  private getPart2Prompt(): string {
    const questions = part2Questions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedTopic = questions[randomIndex];
    return `Generate Part 2 IELTS cue card based on: "${selectedTopic}". Include "You should say:" with 3-4 bullet points.`;
  }

  private getPart3Prompt(questionNumber: number, previousResponses?: string[]): string {
    const part2Topics = part2Questions;
    const randomIndex = Math.floor(Math.random() * part2Topics.length);
    const selectedPart2Topic = part2Topics[randomIndex];
    const context = previousResponses ? `Context: ${previousResponses.join(', ').slice(0, 100)}` : '';
    
    return `Generate Part 3 follow-up question for: "${selectedPart2Topic}". ${context} Make it analytical and discussion-focused.`;
  }

  private getFallbackQuestion(part: number, questionNumber: number): string {
    const fallbacks = {
      1: [
        'Tell me about your hometown.',
        'What do you do for work or study?',
        'Do you have any hobbies?',
        'What kind of music do you like?',
        'How do you usually spend your weekends?'
      ],
      2: [
        'Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like this place.',
        'Describe a person who has influenced you. You should say: who this person is, how you know them, what they are like, and explain how they have influenced you.',
        'Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how this skill would help you.'
      ],
      3: [
        'How do you think education will change in the future?',
        'What are the advantages and disadvantages of modern technology?',
        'How important is it to preserve traditional culture?'
      ]
    };

    const questions = fallbacks[part as keyof typeof fallbacks];
    return questions[questionNumber % questions.length];
  }

  private getFallbackEvaluation() {
    return {
      score: 6.0,
      feedback: 'Your response shows good effort. Focus on expanding your ideas with more details and examples.',
      suggestions: [
        'Try to speak for longer periods',
        'Use more varied vocabulary',
        'Practice connecting your ideas smoothly'
      ]
    };
  }

  private getFallbackModelAnswer(part: number): string {
    const fallbackAnswers = {
      1: "Well, I'd say my hometown is quite interesting. It's a medium-sized city with a good mix of modern facilities and traditional culture. What I particularly enjoy about it is the friendly atmosphere - people are generally quite welcoming and helpful.",
      2: "I'd like to talk about a trip I took to the mountains last year. I went there with my close friends during the summer holidays. We spent most of our time hiking through the scenic trails and exploring the local villages. What made this journey so memorable was the breathtaking views and sense of achievement.",
      3: "I think this is quite a complex issue with several important aspects to consider. On one hand, there are certainly some significant benefits, such as improved efficiency and convenience. However, we also need to be aware of potential drawbacks and find the right balance."
    };

    return fallbackAnswers[part as keyof typeof fallbackAnswers];
  }
}
