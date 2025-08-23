'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, Clock, MessageSquare, Star } from 'lucide-react';
import { OpenAIService } from '@/lib/openai';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface TestSessionProps {
  part: number;
  apiKey: string;
  onExit: () => void;
}

interface Question {
  id: number;
  text: string;
  audioUrl?: string;
}

interface Response {
  questionId: number;
  text: string;
  audioBlob: Blob;
  evaluation?: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}

export default function TestSession({ part, apiKey, onExit }: TestSessionProps) {
  const [openAIService] = useState(() => new OpenAIService(apiKey));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    isRecording,
    isPlaying,
    audioBlob,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    clearAudio,
    error: audioError
  } = useAudioRecorder();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Generate initial question
  useEffect(() => {
    generateQuestion(0);
    setIsTimerRunning(true);
  }, []);

  const generateQuestion = useCallback(async (questionIndex: number) => {
    setIsLoadingQuestion(true);
    try {
      const previousResponses = responses.map(r => r.text);
      const questionText = await openAIService.generateQuestion(part, questionIndex, previousResponses);
      
      // Generate audio for the question
      const audioBuffer = await openAIService.textToSpeech(questionText);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const newQuestion: Question = {
        id: questionIndex,
        text: questionText,
        audioUrl
      };

      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = newQuestion;
        return updated;
      });
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [openAIService, part, responses]);

  const handleRecordingToggle = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearAudio();
      setTranscribedText('');
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, clearAudio]);

  const processResponse = useCallback(async () => {
    if (!audioBlob) return;

    setIsProcessingResponse(true);
    try {
      // Transcribe audio
      const transcription = await openAIService.speechToText(audioBlob);
      setTranscribedText(transcription);

      // Evaluate response
      const evaluation = await openAIService.evaluateResponse(transcription, part);

      // Save response
      const newResponse: Response = {
        questionId: currentQuestionIndex,
        text: transcription,
        audioBlob,
        evaluation
      };

      setResponses(prev => [...prev, newResponse]);
      setShowEvaluation(true);
    } catch (error) {
      console.error('Error processing response:', error);
    } finally {
      setIsProcessingResponse(false);
    }
  }, [audioBlob, openAIService, part, currentQuestionIndex]);

  const nextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setTranscribedText('');
    setShowEvaluation(false);
    clearAudio();

    if (nextIndex < 5) { // Assuming 5 questions per part
      generateQuestion(nextIndex);
    }
  }, [currentQuestionIndex, generateQuestion, clearAudio]);

  const playQuestionAudio = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.audioUrl) {
      const audio = new Audio(currentQuestion.audioUrl);
      audio.play();
    }
  }, [questions, currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestionIndex);
  const isLastQuestion = currentQuestionIndex >= 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                IELTS Speaking Test - Part {part}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{formatTime(timer)}</span>
                </div>
                <div className="text-gray-600">
                  Question {currentQuestionIndex + 1} of 5
                </div>
              </div>
            </div>
            <button
              onClick={onExit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Exit Test
            </button>
          </div>

          {/* Question Display */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Current Question</h3>
              <button
                onClick={playQuestionAudio}
                disabled={!currentQuestion?.audioUrl}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Volume2 size={16} />
              </button>
            </div>
            
            {isLoadingQuestion ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Generating question...</span>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {currentQuestion?.text || 'Loading question...'}
              </p>
            )}
          </div>

          {/* Audio Controls */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <button
              onClick={handleRecordingToggle}
              disabled={isProcessingResponse}
              className={`p-6 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white shadow-lg scale-110 animate-pulse' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:bg-gray-400`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {isRecording ? 'Recording your response...' : 'Click to record your answer'}
              </p>
              <div className="text-xs text-gray-500">
                {isRecording ? 'Click again to stop' : 'Speak clearly into your microphone'}
              </div>
            </div>

            <button
              onClick={isPlaying ? stopAudio : playAudio}
              disabled={!audioBlob}
              className="p-6 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>

          {/* Audio Error */}
          {audioError && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{audioError}</p>
            </div>
          )}

          {/* Processing Status */}
          {isProcessingResponse && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-700 text-sm">Processing your response...</span>
              </div>
            </div>
          )}

          {/* Transcription */}
          {transcribedText && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <MessageSquare size={16} />
                Your Response
              </h4>
              <p className="text-green-700 text-sm">{transcribedText}</p>
            </div>
          )}

          {/* Evaluation */}
          {showEvaluation && currentResponse?.evaluation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-yellow-800 mb-4 flex items-center gap-2">
                <Star size={16} />
                Evaluation & Feedback
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-yellow-700 mb-2">
                    Band Score: {currentResponse.evaluation.score}
                  </div>
                  <p className="text-yellow-700 text-sm">
                    {currentResponse.evaluation.feedback}
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-yellow-800 mb-2">Suggestions for Improvement:</h5>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {currentResponse.evaluation.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-4">
              {audioBlob && !currentResponse && (
                <button
                  onClick={processResponse}
                  disabled={isProcessingResponse}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  Submit Response
                </button>
              )}

              {!isLastQuestion ? (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={onExit}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Complete Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
