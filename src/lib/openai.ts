import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
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
      console.error('Error generating question:', error);
      return this.getFallbackQuestion(part, questionNumber);
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
      console.error('Error evaluating response:', error);
      return this.getFallbackEvaluation();
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
      console.error('Error with text-to-speech:', error);
      throw error;
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
      console.error('Error with speech-to-text:', error);
      throw error;
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
}
