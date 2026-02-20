import { NextResponse } from 'next/server';
import { generateSpeech, VOICE_PRESETS } from '@/lib/tts';

export async function POST(request: Request) {
  try {
    const { text, voiceId = 'default' } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get voice settings from presets
    const voice = VOICE_PRESETS[voiceId as keyof typeof VOICE_PRESETS] || VOICE_PRESETS.default;
    
    // Generate speech using ElevenLabs API
    const audioData = await generateSpeech({
      text,
      voiceId: voice.id,
    });

    // Return the audio data as a base64 string
    const base64Audio = Buffer.from(audioData).toString('base64');
    
    return NextResponse.json({
      audio: base64Audio,
      voice: voice.name,
    });
    
  } catch (error) {
    console.error('TTS generation error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate speech',
      details: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}

// Enable CORS for the API route
export const runtime = 'edge';
