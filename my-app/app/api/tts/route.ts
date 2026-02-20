import { NextResponse } from 'next/server';
import { generateSpeech, VOICE_PRESETS } from '@/lib/tts';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('Missing ELEVENLABS_API_KEY');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('ElevenLabs API error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const audioData = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioData).toString('base64');
    return NextResponse.json({ success: true, audio: base64Audio }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
