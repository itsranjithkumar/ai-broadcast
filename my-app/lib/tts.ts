interface TTSOptions {
  text: string;
  voiceId?: string;
  stability?: number;
  similarity_boost?: number;
}

export async function generateSpeech(options: TTSOptions): Promise<ArrayBuffer> {
  const { text, voiceId = '21m00Tcm4TlvDq8ikWAM', stability = 0.5, similarity_boost = 0.5 } = options;
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set in environment variables');
  }
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability,
            similarity_boost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('ElevenLabs API error:', error);
      throw new Error('Failed to generate speech');
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

// Voice presets
export const VOICE_PRESETS = {
  default: {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel
    name: 'Rachel',
    description: 'Clear and professional female voice',
  },
  male1: {
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi
    name: 'Domi',
    description: 'Deep male voice',
  },
  female1: {
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella
    name: 'Bella',
    description: 'Energetic female voice',
  },
};
