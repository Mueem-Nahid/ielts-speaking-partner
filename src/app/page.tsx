'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import TestSession from '@/components/TestSession';
import { useError } from '@/contexts/ErrorContext';
import { OpenAIService } from '@/lib/openai';

type TestPart = 1 | 2 | 3;
type TestPhase = 'setup' | 'active' | 'completed';

interface TestSession {
  part: TestPart;
  phase: TestPhase;
  currentQuestion: number;
  responses: string[];
}

export default function IELTSSpeakingPartner() {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [session, setSession] = useState<TestSession>({
    part: 1,
    phase: 'setup',
    currentQuestion: 0,
    responses: []
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const { showError } = useError();

  // API Key storage functions
  const saveApiKey = (key: string) => {
    const expirationTime = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
    const apiKeyData = {
      key: key,
      expiration: expirationTime
    };
    localStorage.setItem('ielts-api-key', JSON.stringify(apiKeyData));
  };

  const loadApiKey = () => {
    try {
      const storedData = localStorage.getItem('ielts-api-key');
      if (storedData) {
        const apiKeyData = JSON.parse(storedData);
        if (Date.now() < apiKeyData.expiration) {
          return apiKeyData.key;
        } else {
          // Key has expired, remove it
          localStorage.removeItem('ielts-api-key');
        }
      }
    } catch (error) {
      console.error('Error loading API key from localStorage:', error);
      localStorage.removeItem('ielts-api-key');
    }
    return null;
  };

  const clearApiKey = () => {
    localStorage.removeItem('ielts-api-key');
    setApiKey('');
    setIsApiKeySet(false);
  };

  // Load API key on component mount
  useEffect(() => {
    const storedApiKey = loadApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  const handleApiKeySubmit = async () => {
    if (apiKey.trim()) {
      setIsValidatingKey(true);
      try {
        const openAIService = new OpenAIService(apiKey.trim());
        const validation = await openAIService.validateApiKey();
        if (validation.isValid) {
          saveApiKey(apiKey.trim());
          setIsApiKeySet(true);
          setShowSettings(false);
        } else {
          showError(validation.error || 'Invalid API key. Please check your key and try again.');
        }
      } catch (error) {
        showError('Failed to validate API key. Please check your internet connection and try again.');
      } finally {
        setIsValidatingKey(false);
      }
    }
  };

  const startTest = (part: TestPart) => {
    setSession({
      part,
      phase: 'active',
      currentQuestion: 0,
      responses: []
    });
  };

  if (!isApiKeySet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">IELTS Speaking Partner</h1>
            <p className="text-gray-600">Enter your OpenAI API key to get started</p>
          </div>
          
          <div className="space-y-4">
            <form>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
            
            <button
              onClick={handleApiKeySubmit}
              disabled={!apiKey.trim() || isValidatingKey}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isValidatingKey ? 'Validating...' : 'Start Practice'}
            </button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            Your API key is stored locally for 3 days and never sent to our servers
          </div>
        </div>
      </div>
    );
  }

  if (session.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">IELTS Speaking Test</h1>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Part 1 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <h2 className="text-xl font-semibold text-green-800 mb-3">Part 1</h2>
                <p className="text-green-700 mb-4 text-sm">
                  Introduction and interview (4-5 minutes)
                </p>
                <ul className="text-green-600 text-sm mb-6 space-y-1">
                  <li>• Personal questions</li>
                  <li>• Familiar topics</li>
                  <li>• Home, family, work, studies</li>
                </ul>
                <button
                  onClick={() => startTest(1)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Start Part 1
                </button>
              </div>

              {/* Part 2 */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                <h2 className="text-xl font-semibold text-orange-800 mb-3">Part 2</h2>
                <p className="text-orange-700 mb-4 text-sm">
                  Long turn (3-4 minutes)
                </p>
                <ul className="text-orange-600 text-sm mb-6 space-y-1">
                  <li>• 1 minute preparation</li>
                  <li>• 2 minutes speaking</li>
                  <li>• Topic card with prompts</li>
                </ul>
                <button
                  onClick={() => startTest(2)}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Start Part 2
                </button>
              </div>

              {/* Part 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <h2 className="text-xl font-semibold text-purple-800 mb-3">Part 3</h2>
                <p className="text-purple-700 mb-4 text-sm">
                  Discussion (4-5 minutes)
                </p>
                <ul className="text-purple-600 text-sm mb-6 space-y-1">
                  <li>• Abstract questions</li>
                  <li>• Related to Part 2 topic</li>
                  <li>• More complex discussion</li>
                </ul>
                <button
                  onClick={() => startTest(3)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Part 3
                </button>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">How it works</h3>
              <div className="grid md:grid-cols-2 gap-4 text-blue-700 text-sm">
                <div>
                  <h4 className="font-medium mb-2">🎤 Voice Interaction</h4>
                  <p>Speak naturally with AI examiner using advanced voice technology</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📝 Real-time Feedback</h4>
                  <p>Get instant feedback on your pronunciation and fluency</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⏱️ Timed Practice</h4>
                  <p>Practice with authentic IELTS timing and structure</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🎯 Targeted Practice</h4>
                  <p>Focus on specific parts or practice the complete test</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <form>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    API key is stored locally for 3 days, then automatically removed
                  </p>
                </form>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearApiKey}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Clear Key
                  </button>
                  <button
                    onClick={handleApiKeySubmit}
                    disabled={isValidatingKey}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isValidatingKey ? 'Validating...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active test interface - use the TestSession component
  return (
    <TestSession 
      part={session.part} 
      apiKey={apiKey} 
      onExit={() => setSession(prev => ({ ...prev, phase: 'setup' }))}
    />
  );
}
