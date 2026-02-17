'use client';

import { useState, useRef, useEffect } from 'react';
import { VOICE_PRESETS } from '@/lib/tts';

type VoiceStyle = {
  id: string;
  name: string;
  description: string;
};

type VideoStyle = 'karaoke' | 'quote' | 'story';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('default');
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('karaoke');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Convert VOICE_PRESETS to array for rendering
  const voices = Object.entries(VOICE_PRESETS).map(([id, voice]) => ({
    id,
    name: voice.name,
    description: voice.description,
  }));

  const videoStyles = [
    { id: 'karaoke', name: 'Karaoke Style' },
    { id: 'quote', name: 'Quote Builder' },
    { id: 'story', name: 'Story Mode' },
  ];

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setAudioUrl(null);
    
    try {
      // Call our API route to generate speech
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          voiceId: selectedVoice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate speech');
      }

      const { audio } = await response.json();
      
      // Convert base64 audio to a playable URL
      const audioBlob = base64ToBlob(audio, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      
    } catch (error) {
      console.error('Error generating speech:', error);
      // TODO: Show error message to user
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to convert base64 to Blob
  function base64ToBlob(base64: string, type: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }
  
  // Handle play/pause of audio
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600 mb-4">
            VoxReel
          </h1>
          <p className="text-xl text-gray-300">
            Transform text into engaging voice-driven videos
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Input */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Create Your Video</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter your text
                </label>
                <textarea
                  id="text-input"
                  className="w-full h-48 px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type or paste your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Voice Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedVoice === voice.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {videoStyles.map((style) => (
                    <button
                      key={style.id}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedStyle === style.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedStyle(style.id as VideoStyle)}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isGenerating || !inputText.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Audio'
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Preview</h2>
            
            <div className="aspect-9/16 bg-gray-900 rounded-lg overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center p-6">
                {audioUrl ? (
                  <div className="text-center">
                    <button
                      onClick={togglePlayPause}
                      className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center mb-4 mx-auto transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <p className="text-gray-300 mt-2">
                      {isPlaying ? 'Playing...' : 'Audio ready'}
                    </p>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <div className="mx-auto w-16 h-16 mb-4 border-4 border-dashed border-gray-700 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-6-9a4 4 0 01-4-4V5a4 4 0 118 0v6a4 4 0 01-4 4z"
                        />
                      </svg>
                    </div>
                    <p>Your generated audio will appear here</p>
                    <p className="text-sm mt-2 text-gray-600">
                      Enter text and click "Generate Audio" to create your content
                    </p>
                  </div>
                )}
              </div>
              
              {/* Audio visualization placeholder */}
              <div className="h-24 bg-gray-800 p-4">
                <div className="flex items-end h-full space-x-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                        animation: isPlaying ? `equalize ${Math.random() * 0.5 + 0.5}s infinite alternate` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {videoUrl && (
              <div className="mt-4 flex justify-center space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Download
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}