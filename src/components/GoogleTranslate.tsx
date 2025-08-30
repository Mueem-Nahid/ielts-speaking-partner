'use client';

import { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Volume2 } from 'lucide-react';

interface CompactGoogleTranslateProps {
  className?: string;
}

export default function GoogleTranslate({ className = "" }: CompactGoogleTranslateProps) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');

  const translateText = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError('');

    try {
      // Using Google Translate API through a free service
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=en|bn`
      );
      
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      translateText();
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Languages className="text-blue-600" size={18} />
        <h4 className="text-sm font-semibold text-gray-800">Quick Translate (EN → BN)</h4>
      </div>

      <div className="space-y-3">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter English word..."
            className="flex-1 px-3 py-2 text-sm border border-gray-400 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <button
            onClick={translateText}
            disabled={!inputText.trim() || isTranslating}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isTranslating ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              'Translate'
            )}
          </button>
        </div>

        {/* Output */}
        {translatedText && (
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
            <span className="text-sm text-gray-800 flex-1">{translatedText}</span>
            <button
              onClick={() => copyToClipboard(translatedText)}
              className="ml-2 p-1 text-gray-500 hover:text-blue-600"
              title="Copy translation"
            >
              <Copy size={14} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-2 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
