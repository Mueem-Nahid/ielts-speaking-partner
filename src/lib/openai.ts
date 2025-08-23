import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  // Validate API key by making a simple test request
  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Make a simple request to test the API key
      await this.client.models.list();
      return { isValid: true };
    } catch (error: any) {
      console.error('API key validation failed:', error);
      
      if (error?.status === 401) {
        return { 
          isValid: false, 
          error: 'Invalid API key. Please check your OpenAI API key and try again.' 
        };
      } else if (error?.status === 429) {
        return { 
          isValid: false, 
          error: 'API rate limit exceeded. Please try again later or check your OpenAI account.' 
        };
      } else if (error?.status === 403) {
        return { 
          isValid: false, 
          error: 'API access forbidden. Please ensure your API key has the required permissions.' 
        };
      } else if (error?.code === 'insufficient_quota') {
        return { 
          isValid: false, 
          error: 'Insufficient API quota. Please check your OpenAI account billing.' 
        };
      } else {
        return { 
          isValid: false, 
          error: 'Failed to connect to OpenAI. Please check your internet connection and try again.' 
        };
      }
    }
  }

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

  async generateQuestion(part: number, questionNumber: number, previousResponses?: string[]): Promise<string> {
    const prompts = {
      1: this.getPart1Prompt(questionNumber),
      2: this.getPart2Prompt(questionNumber),
      3: this.getPart3Prompt(questionNumber, previousResponses)
    };

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an IELTS speaking examiner. Generate authentic IELTS speaking questions based on the part and context provided. Keep questions natural and appropriate for the test format.'
          },
          {
            role: 'user',
            content: prompts[part as keyof typeof prompts]
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || 'Could you tell me about yourself?';
    } catch (error) {
      this.handleApiError(error, 'generate question');
    }
  }

  async evaluateResponse(response: string, part: number): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    try {
      const evaluation = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an IELTS speaking examiner. Evaluate the following response for Part ${part} of the IELTS speaking test. 
            
            Provide feedback on:
            - Fluency and Coherence
            - Lexical Resource (vocabulary)
            - Grammatical Range and Accuracy
            - Pronunciation (based on text analysis)
            
            Give a band score (1-9) and specific suggestions for improvement.
            
            Respond in JSON format:
            {
              "score": number,
              "feedback": "detailed feedback string",
              "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
            }`
          },
          {
            role: 'user',
            content: `Part ${part} response: "${response}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });

      const content = evaluation.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return this.getFallbackEvaluation();
        }
      }
      return this.getFallbackEvaluation();
    } catch (error) {
      this.handleApiError(error, 'evaluate response');
    }
  }

  async generateModelAnswer(question: string, part: number, userResponse?: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an IELTS speaking expert. ${userResponse ? 'Improve and refine the user\'s response' : 'Generate a model answer'} for the given question that would achieve a band score of 7.0-7.5.

            ${userResponse ? `
            TASK: Take the user's response and improve it while keeping the same core content and personal details. 
            
            Improvements should include:
            - Fix grammatical errors and awkward phrasing
            - Enhance vocabulary with more sophisticated words where appropriate
            - Improve sentence structure and flow
            - Add natural hesitations and fillers (um, well, you know) for authenticity
            - Maintain the user's personal information and experiences
            - Keep the same overall message and meaning
            - Make it sound more natural and fluent
            
            Do NOT change the user's personal details, job, experiences, or core message. Only improve the language quality.
            ` : `
            TASK: Generate a completely new model answer.
            `}

            For Part ${part}, the response should demonstrate:
            - Natural fluency with occasional hesitation
            - Good range of vocabulary with some less common words
            - Mix of simple and complex sentence structures
            - Generally accurate grammar with minor errors
            - Clear pronunciation and appropriate intonation
            
            ${part === 1 ? 'Keep the response concise (30-60 seconds worth of speech).' : ''}
            ${part === 2 ? 'Structure the response to cover all bullet points and speak for about 2 minutes.' : ''}
            ${part === 3 ? 'Provide a thoughtful, analytical response with examples and explanations.' : ''}
            
            Make the response sound natural and conversational, not overly formal or rehearsed.`
          },
          {
            role: 'user',
            content: userResponse 
              ? `Question: "${question}"\n\nUser's Response: "${userResponse}"\n\nPlease improve this response to band 7-7.5 level while keeping the same personal details and core content.`
              : `Generate a band 7-7.5 model answer for this IELTS Part ${part} question: "${question}"`
          }
        ],
        max_tokens: part === 2 ? 400 : 250,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || this.getFallbackModelAnswer(part);
    } catch (error) {
      this.handleApiError(error, 'generate model answer');
    }
  }

  async textToSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await this.client.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
        speed: 0.9
      });

      return await response.arrayBuffer();
    } catch (error) {
      this.handleApiError(error, 'convert text to speech');
    }
  }

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

  private getPart1Prompt(questionNumber: number): string {
    const topics = [
      'hometown and where you live',
      'work or studies',
      'family and friends',
      'hobbies and interests',
      'daily routine',
      'food and cooking',
      'travel and transportation',
      'technology and social media',
      'weather and seasons',
      'shopping and money'
    ];

    const topic = topics[questionNumber % topics.length];
    return `Generate a Part 1 IELTS speaking question about ${topic}. Make it personal and suitable for getting to know the candidate.`;
  }

  private getPart2Prompt(questionNumber: number): string {
    const topics = [
      'a memorable journey or trip',
      'a person who has influenced you',
      'a skill you would like to learn',
      'a book or movie you enjoyed',
      'a place you would like to visit',
      'an important decision you made',
      'a celebration or festival',
      'a piece of technology you use',
      'a childhood memory',
      'a goal you want to achieve'
    ];

    const topic = topics[questionNumber % topics.length];
    return `Generate a Part 2 IELTS speaking question about ${topic}. Include the standard format with "You should say:" and 3-4 bullet points, ending with "and explain why..."`;
  }

  private getPart3Prompt(questionNumber: number, previousResponses?: string[]): string {
    const themes = [
      'education and learning',
      'technology and society',
      'environment and sustainability',
      'work and career development',
      'culture and traditions',
      'health and lifestyle',
      'communication and relationships',
      'travel and globalization',
      'media and entertainment',
      'future trends and changes'
    ];

    const theme = themes[questionNumber % themes.length];
    const context = previousResponses ? `Based on previous discussion about: ${previousResponses.join(', ')}` : '';
    
    return `Generate a Part 3 IELTS speaking question about ${theme}. ${context} Make it abstract and analytical, suitable for discussion and opinion.`;
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
      1: "Well, I'd say my hometown is quite interesting. It's a medium-sized city with a good mix of modern facilities and traditional culture. What I particularly enjoy about it is the friendly atmosphere - people are generally quite welcoming and helpful. There are also some lovely parks where I like to spend time, especially during weekends when the weather is nice.",
      2: "I'd like to talk about a trip I took to the mountains last year. I went there with my close friends during the summer holidays. We spent most of our time hiking through the scenic trails and exploring the local villages. What made this journey so memorable was not just the breathtaking views, but also the sense of achievement we felt after completing some challenging hikes. It really strengthened our friendship and gave us a chance to disconnect from our busy daily routines.",
      3: "I think this is quite a complex issue with several important aspects to consider. On one hand, there are certainly some significant benefits, such as improved efficiency and convenience. However, we also need to be aware of potential drawbacks, including the impact on traditional practices and social relationships. In my opinion, the key is finding the right balance - embracing positive changes while preserving what's valuable from the past."
    };

    return fallbackAnswers[part as keyof typeof fallbackAnswers];
  }
}
