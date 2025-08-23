# IELTS Speaking Partner 🎤

An AI-powered IELTS speaking practice application that provides realistic test simulation with real-time feedback and scoring using OpenAI's advanced voice technology.

🌐 **Live Demo**: [https://ielts-speaking-partner.vercel.app/](https://ielts-speaking-partner.vercel.app/)

## 🌟 Features

### Complete IELTS Test Coverage
- **Part 1**: Introduction and interview (4-5 minutes) - Personal questions about familiar topics
- **Part 2**: Long turn (3-4 minutes) - Topic card with preparation time and structured speaking
- **Part 3**: Discussion (4-5 minutes) - Abstract follow-up questions related to Part 2 topics

### Advanced AI Integration
- **Voice Recognition**: OpenAI Whisper for accurate speech-to-text transcription
- **Text-to-Speech**: Natural-sounding AI examiner voice using OpenAI TTS
- **Smart Question Generation**: GPT-4 powered dynamic question creation from authentic IELTS database
- **Intelligent Evaluation**: Real-time band score assessment with detailed feedback
- **Personalized Improvements**: AI enhances your responses to band 7-7.5 level while preserving your personal details
- **Authentic IELTS Flow**: Part 3 questions are contextually related to Part 2 topics, just like the real test

### Professional Features
- 🎯 **Authentic IELTS Format**: Questions follow official test structure and timing
- 📊 **Real-time Scoring**: Instant band scores (1-9) with detailed feedback
- 🎙️ **High-Quality Audio**: Professional recording with noise suppression
- ⏱️ **Timer Integration**: Track your speaking time like in real tests
- 📝 **Transcription**: See exactly what you said for self-assessment
- 💡 **Improvement Suggestions**: Specific tips for better performance
- 🔄 **Random Questions**: Never get the same questions twice - unlimited variety
- 🛡️ **Secure API Key Management**: 3-day local storage with automatic expiration
- ⚡ **Global Error Handling**: Comprehensive error management with user-friendly messages

## 🚀 Getting Started

### Quick Start (Recommended)
Visit the live application: **[https://ielts-speaking-partner.vercel.app/](https://ielts-speaking-partner.vercel.app/)**

1. Enter your OpenAI API key (stored securely in your browser for 3 days)
2. Grant microphone permission
3. Choose your test part and start practicing!

### Local Development

#### Prerequisites
- Node.js 18+ installed
- OpenAI API key with access to GPT-4 and Whisper models
- Modern web browser with microphone access

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ielts-speaking-partner.git
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

## 🎯 How to Use

### Starting a Practice Session

1. **API Key Setup**
   - Enter your OpenAI API key on first visit
   - Key is validated before saving
   - Stored securely in browser for 3 days, then automatically removed

2. **Select Test Part**
   - **Part 1**: Personal questions from 54 authentic IELTS topics
   - **Part 2**: Cue card topics from 140+ comprehensive database
   - **Part 3**: Follow-up questions contextually related to Part 2 topics

3. **Practice Flow**
   - Listen to AI-generated question variations (click speaker icon)
   - Click microphone to start recording your response
   - Speak naturally and clearly
   - Click microphone again to stop recording
   - Submit your response for evaluation

4. **Get Comprehensive Feedback**
   - View your transcribed response
   - Receive band score (1-9 scale)
   - Read detailed feedback on:
     - Fluency and Coherence
     - Lexical Resource (vocabulary)
     - Grammatical Range and Accuracy
     - Pronunciation assessment

5. **Learn from Personalized Model Answers**
   - Click "Show Model Answer" after receiving feedback
   - View AI-improved version of YOUR response (not generic answers)
   - Maintains your personal details while enhancing language quality
   - Learn proper structure, vocabulary, and fluency patterns

6. **Continue Practice**
   - Get fresh, random questions every time
   - Switch between test parts seamlessly
   - Experience authentic IELTS test flow

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main application with API key management
│   ├── layout.tsx            # App layout with error provider
│   └── globals.css           # Global styles
├── components/
│   └── TestSession.tsx       # Complete test session management
├── contexts/
│   └── ErrorContext.tsx     # Global error handling system
├── hooks/
│   └── useAudioRecorder.ts   # Audio recording functionality
├── lib/
│   └── openai.ts             # OpenAI service with comprehensive error handling
└── data/
    ├── part_1_questions.json # 54 authentic Part 1 questions
    ├── part_2_questions.json # 140+ Part 2 topics
    └── ielts-questions.json  # Additional question database
```

## 🔧 Technical Details

### Built With
- **Next.js 15** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **OpenAI API** - GPT-4, Whisper, and TTS models
- **Web Audio API** - Browser audio recording
- **Vercel** - Deployment and hosting

### Key Features

#### Authentic Question Database
- **Part 1**: 54 carefully curated personal questions
- **Part 2**: 140+ comprehensive cue card topics
- **Part 3**: AI-generated follow-ups based on Part 2 topics
- **Random Selection**: Different questions every session
- **AI Variations**: Fresh question variations using your database as prompts

#### Advanced Error Handling
- **API Key Validation**: Detects fake/invalid keys before saving
- **Network Error Recovery**: Graceful handling of connection issues
- **User-Friendly Messages**: Clear, actionable error notifications
- **Automatic Error Clearing**: Errors disappear after 5 seconds
- **Fallback Systems**: Backup questions if API fails

#### Security & Privacy
- **Local Storage Only**: API keys never sent to external servers
- **3-Day Expiration**: Automatic key removal for security
- **No Data Collection**: Your responses stay private
- **Secure Validation**: Keys validated before storage

## 🎨 User Interface

### Design Features
- **Modern UI**: Clean, professional interface optimized for focus
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Visual Feedback**: Clear recording status and progress indicators
- **Accessibility**: Keyboard navigation and screen reader support
- **Loading States**: Visual feedback during API key validation

### Color Coding
- **Green**: Part 1 (Introduction & Interview)
- **Orange**: Part 2 (Long Turn & Cue Cards)
- **Purple**: Part 3 (Discussion & Analysis)
- **Blue**: Primary actions and navigation
- **Red**: Error states and warnings

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

### Live Application
The app is deployed on Vercel: **[https://ielts-speaking-partner.vercel.app/](https://ielts-speaking-partner.vercel.app/)**

### Deploy Your Own
1. Fork this repository
2. Connect to Vercel
3. Deploy with one click
4. No environment variables needed (API keys handled client-side)

### Build for Production
```bash
npm run build
npm start
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
- Check browser permissions in address bar
- Ensure HTTPS connection (required for microphone access)
- Try refreshing the page and granting permission again

**API Key errors?**
- Verify your OpenAI API key is valid and active
- Check your OpenAI account has sufficient credits
- Ensure you have access to GPT-4 and Whisper models
- Try entering the key again (validation happens automatically)

**Audio playback issues?**
- Check browser audio settings
- Ensure speakers/headphones are connected
- Try a different browser (Chrome recommended)

**Questions not generating?**
- Check your internet connection
- Verify API key has proper permissions
- Look for error messages in the top-right corner

### Getting Help
- Check the browser console for detailed error messages
- Verify all dependencies are installed correctly
- Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)
- Visit the live demo to test functionality

## 🎯 Future Enhancements

- [ ] Progress tracking and analytics dashboard
- [ ] Custom question sets and topics
- [ ] Multiple AI voice options and accents
- [ ] Offline mode with cached questions
- [ ] Performance history and improvement trends
- [ ] Group practice sessions and competitions
- [ ] Integration with IELTS preparation courses
- [ ] Mobile app versions (iOS/Android)
- [ ] Advanced pronunciation analysis
- [ ] Speaking fluency metrics and graphs

## 🙏 Acknowledgments

- **OpenAI** for providing advanced AI models (GPT-4, Whisper, TTS)
- **IELTS** for the official test format guidelines and structure
- **Vercel** for excellent hosting and deployment platform
- **Next.js Team** for the amazing React framework
- **The open-source community** for excellent tools and libraries

## 📈 Project Stats

- **54** Authentic Part 1 questions
- **140+** Part 2 cue card topics  
- **Unlimited** Part 3 follow-up questions
- **Real-time** AI evaluation and feedback
- **3-day** secure API key storage
- **100%** client-side privacy protection

---

**Ready to ace your IELTS speaking test?** 🚀

**Practice now**: [https://ielts-speaking-partner.vercel.app/](https://ielts-speaking-partner.vercel.app/)

*Transform your IELTS speaking skills with AI-powered practice that adapts to you!*
