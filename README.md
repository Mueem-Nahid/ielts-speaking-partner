# IELTS Speaking Partner 🎤

An AI-powered IELTS speaking practice application that provides realistic test simulation with real-time feedback and scoring using OpenAI's advanced voice technology.

## 🌟 Features

### Complete IELTS Test Coverage
- **Part 1**: Introduction and interview (4-5 minutes) - Personal questions about familiar topics
- **Part 2**: Long turn (3-4 minutes) - Topic card with preparation time and structured speaking
- **Part 3**: Discussion (4-5 minutes) - Abstract questions and complex discussions

### Advanced AI Integration
- **Voice Recognition**: OpenAI Whisper for accurate speech-to-text transcription
- **Text-to-Speech**: Natural-sounding AI examiner voice using OpenAI TTS
- **Smart Question Generation**: GPT-4 powered dynamic question creation
- **Intelligent Evaluation**: Real-time band score assessment with detailed feedback
- **Improved Responses**: AI takes your response and improves it to band 7-7.5 level while keeping your personal details

### Professional Features
- 🎯 **Authentic IELTS Format**: Questions follow official test structure and timing
- 📊 **Real-time Scoring**: Instant band scores (1-9) with detailed feedback
- 🎙️ **High-Quality Audio**: Professional recording with noise suppression
- ⏱️ **Timer Integration**: Track your speaking time like in real tests
- 📝 **Transcription**: See exactly what you said for self-assessment
- 💡 **Improvement Suggestions**: Specific tips for better performance

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenAI API key with access to GPT-4 and Whisper models
- Modern web browser with microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ielts-speaking-partner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Setup

1. **Enter API Key**: When you first open the app, enter your OpenAI API key
2. **Grant Microphone Permission**: Allow browser access to your microphone
3. **Choose Test Part**: Select Part 1, 2, or 3 to begin practice

## 🎯 How to Use

### Starting a Practice Session

1. **Select Test Part**
   - **Part 1**: Personal questions about yourself, family, work, hobbies
   - **Part 2**: Describe a topic with specific prompts (2 minutes speaking)
   - **Part 3**: Abstract discussion questions related to Part 2 topic

2. **Practice Flow**
   - Listen to AI-generated questions (click speaker icon)
   - Click microphone to start recording your response
   - Speak naturally and clearly
   - Click microphone again to stop recording
   - Submit your response for evaluation

3. **Get Feedback**
   - View your transcribed response
   - Receive band score (1-9 scale)
   - Read detailed feedback on:
     - Fluency and Coherence
     - Lexical Resource (vocabulary)
     - Grammatical Range and Accuracy
     - Pronunciation assessment

4. **Learn from Model Answers**
   - Click "Show Model Answer" after receiving feedback
   - Study AI-generated band 7-7.5 standard responses
   - Compare your answer with the model to identify improvements
   - Learn proper structure, vocabulary, and fluency patterns

5. **Continue Practice**
   - Move to next question
   - Switch between test parts
   - Review previous responses

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main application component
│   ├── layout.tsx            # App layout
│   └── globals.css           # Global styles
├── components/
│   └── TestSession.tsx       # Test session management
├── hooks/
│   └── useAudioRecorder.ts   # Audio recording functionality
└── lib/
    └── openai.ts             # OpenAI service integration
```

## 🔧 Technical Details

### Built With
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **OpenAI API** - GPT-4, Whisper, and TTS models
- **Web Audio API** - Browser audio recording

### Key Components

#### OpenAI Service (`src/lib/openai.ts`)
- Question generation for all test parts
- Speech-to-text transcription
- Text-to-speech for questions
- Response evaluation and scoring

#### Audio Recorder Hook (`src/hooks/useAudioRecorder.ts`)
- Real-time audio recording
- Playback functionality
- Error handling and permissions

#### Test Session Component (`src/components/TestSession.tsx`)
- Complete test flow management
- Timer and progress tracking
- Response evaluation display

## 🎨 User Interface

### Design Features
- **Modern UI**: Clean, professional interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Visual Feedback**: Clear recording status and progress indicators
- **Accessibility**: Keyboard navigation and screen reader support

### Color Coding
- **Green**: Part 1 (Introduction)
- **Orange**: Part 2 (Long turn)
- **Purple**: Part 3 (Discussion)
- **Blue**: Primary actions and navigation

## 🔒 Privacy & Security

- **Local Storage**: API keys stored only in browser localStorage
- **No Data Collection**: Responses not stored on external servers
- **Secure Communication**: Direct API calls to OpenAI
- **Microphone Privacy**: Audio only processed during active recording

## 📊 Evaluation Criteria

The AI evaluates responses based on official IELTS criteria:

1. **Fluency and Coherence** (25%)
   - Speaking rate and flow
   - Logical sequencing of ideas
   - Use of cohesive devices

2. **Lexical Resource** (25%)
   - Vocabulary range and accuracy
   - Appropriate word choice
   - Paraphrasing ability

3. **Grammatical Range and Accuracy** (25%)
   - Sentence structure variety
   - Grammar accuracy
   - Complex structure usage

4. **Pronunciation** (25%)
   - Individual sound clarity
   - Word stress and intonation
   - Overall intelligibility

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file for production:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Microphone not working?**
- Check browser permissions
- Ensure HTTPS connection (required for microphone access)
- Try refreshing the page

**API errors?**
- Verify your OpenAI API key is valid
- Check your OpenAI account has sufficient credits
- Ensure you have access to GPT-4 and Whisper models

**Audio playback issues?**
- Check browser audio settings
- Ensure speakers/headphones are connected
- Try a different browser

### Getting Help
- Check the browser console for error messages
- Verify all dependencies are installed correctly
- Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)

## 🎯 Future Enhancements

- [ ] Progress tracking and analytics
- [ ] Custom question sets
- [ ] Multiple AI voice options
- [ ] Offline mode with cached questions
- [ ] Performance history and trends
- [ ] Group practice sessions
- [ ] Integration with IELTS preparation courses

## 🙏 Acknowledgments

- OpenAI for providing advanced AI models
- IELTS for the official test format guidelines
- The open-source community for excellent tools and libraries

---

**Ready to improve your IELTS speaking skills?** Start practicing now at `http://localhost:3000`! 🚀
