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
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lyricScrollRef = useRef<HTMLDivElement>(null);
  
  const voices = Object.entries(VOICE_PRESETS).map(([id, voice]) => ({
    id,
    name: voice.name,
    description: voice.description,
  }));

  const videoStyles = [
    { id: 'karaoke', name: 'Karaoke' },
    { id: 'quote', name: 'Quote' },
    { id: 'story', name: 'Story' },
  ];

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setAudioUrl(null);
    
    try {
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
      
      const audioBlob = base64ToBlob(audio, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  function base64ToBlob(base64: string, type: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Split text into lines for lyric display
  const lyricLines = inputText.split('\n').filter(line => line.trim());
  
  // Calculate word count per line and total words
  const wordsPerLine = lyricLines.map(line => line.split(/\s+/).filter(Boolean).length);
  const totalWords = wordsPerLine.reduce((sum, count) => sum + count, 0);
  
  // Calculate current word index based on audio progress
  const currentWordIndex = duration > 0 
    ? Math.floor((currentTime / duration) * totalWords)
    : 0;
  
  // Find which line we're currently on based on word count
  let currentLineIndex = 0;
  let wordCount = 0;
  
  for (let i = 0; i < wordsPerLine.length; i++) {
    wordCount += wordsPerLine[i];
    if (currentWordIndex < wordCount) {
      currentLineIndex = i;
      break;
    }
  }

  // Store previous line index to detect changes
  const prevLineIndexRef = useRef(0);

  // Auto-scroll lyrics when line changes
  useEffect(() => {
    const scrollElement = lyricScrollRef.current;
    if (!scrollElement || currentLineIndex === prevLineIndexRef.current) return;
    
    // Only scroll when moving to a new line
    if (currentLineIndex > prevLineIndexRef.current) {
      const lyricElements = Array.from(scrollElement.querySelectorAll('div[class*="text-center"]'));
      if (lyricElements.length === 0 || currentLineIndex >= lyricElements.length) return;

      const activeLine = lyricElements[currentLineIndex];
      if (!activeLine) return;

      const containerHeight = scrollElement.clientHeight;
      const activeLineRect = activeLine.getBoundingClientRect();
      const containerRect = scrollElement.getBoundingClientRect();
      const scrollTop = scrollElement.scrollTop;
      const lineTop = activeLineRect.top - containerRect.top + scrollTop;
      const lineHeight = activeLineRect.height;
      
      // Calculate target scroll position to show current and next line
      const targetScrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
      
      // Smooth scroll to the target position
      scrollElement.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
    
    prevLineIndexRef.current = currentLineIndex;
  }, [currentLineIndex]);

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'voiceover.mp3';
    a.click();
  };
  
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [audioUrl]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1) 76%, transparent 77%, transparent)`,
        backgroundSize: '50px 50px',
      }} />
      
      <div className="relative z-10 container mx-auto px-6 py-12 md:py-20 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-24">
          <div className="mb-8">
            <div className="inline-block px-4 py-2 rounded-full border border-gray-700 bg-gray-900/50 backdrop-blur">
              <p className="text-sm text-gray-400">Professional AI Voice Generation</p>
            </div>
          </div>
          <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-6">
            VoxReel
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Create stunning voice content with advanced AI. Professional quality, instant results.
          </p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {/* Left Column: Input Section */}
          <div className="space-y-8">
            {/* Text Input */}
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-4">
                Your Script
              </label>
              <textarea
                id="text-input"
                className="w-full h-48 px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all resize-none"
                placeholder="Enter your text, story, or quote..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-2">{inputText.length} characters</p>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Voice
              </label>
              <div className="space-y-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 border ${
                      selectedVoice === voice.id
                        ? 'bg-white text-black border-white'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-white'
                    }`}
                  >
                    <p className="font-medium text-sm">{voice.name}</p>
                    <p className={`text-xs ${selectedVoice === voice.id ? 'text-gray-700' : 'text-gray-500'}`}>
                      {voice.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {videoStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id as VideoStyle)}
                    className={`p-4 rounded-lg transition-all duration-200 border text-center font-medium ${
                      selectedStyle === style.id
                        ? 'bg-white text-black border-white'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isGenerating || !inputText.trim()
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-100 active:scale-95'
              }`}
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          {/* Right Column: Preview Section */}
          <div>
            {/* Video Preview Container */}
            <div className="border border-gray-800 rounded-lg overflow-hidden flex flex-col h-96 bg-gray-900">
              {/* Lyrics Display Section */}
              <div 
                ref={lyricScrollRef}
                className="flex-1 overflow-y-auto px-8 py-8 scroll-smooth"
                style={{
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'thin',
                }}
              >
                {audioUrl ? (
                  <div className="space-y-4">
                    <div className="h-20" />
                    {lyricLines.length > 0 ? (
                      lyricLines.map((line, idx) => (
                        <div 
                          key={idx}
                          className={`text-center transition-all duration-300 px-4 py-2 rounded-lg ${
                            idx === currentLineIndex
                              ? 'text-white text-2xl font-semibold bg-gray-800 scale-105'
                              : idx < currentLineIndex
                              ? 'text-gray-700 text-lg opacity-50'
                              : 'text-gray-600 text-lg'
                          }`}
                        >
                          {line}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-600">No lyrics to display</div>
                    )}
                    <div className="h-20" />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                        <svg className="h-10 w-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-6-9a4 4 0 01-4-4V5a4 4 0 118 0v6a4 4 0 01-4 4z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Ready to create?</h3>
                      <p className="text-gray-500">Enter your text and generate to see lyrics</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Player Controls */}
              {audioUrl && (
                <>
                  {/* Progress Bar and Controls */}
                  <div className="border-t border-gray-800 bg-gray-950 p-6 space-y-4">
                    {/* Time and Progress */}
                    <div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden cursor-pointer">
                        <div 
                          className="h-full bg-white transition-all duration-75"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
                        <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
                      </div>
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={togglePlayPause}
                        className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 text-black flex items-center justify-center transition-all active:scale-95"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-black" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-black ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <audio
                ref={audioRef}
                src={audioUrl || ''}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
              />
            </div>

            {/* Action Buttons */}
            {audioUrl && (
              <div className="mt-6 flex gap-3 justify-center">
                <button 
                  onClick={handleDownload}
                  className="px-6 py-3 bg-gray-900 border border-gray-800 text-white rounded-lg font-medium transition-all hover:bg-gray-800 active:scale-95"
                >
                  Download
                </button>
                <button className="px-6 py-3 bg-white text-black rounded-lg font-medium transition-all hover:bg-gray-100 active:scale-95">
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-800">
          {[
            { title: 'Multiple Voices', desc: 'Professional voice options' },
            { title: 'Video Modes', desc: 'Karaoke, Quote & Story styles' },
            { title: 'Instant Generation', desc: 'Create content in seconds' },
          ].map((feature, idx) => (
            <div key={idx} className="text-center">
              <h3 className="font-medium text-lg text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
