// https://docs.spring.io/spring-ai/reference/api/chat/minimax-chat.html
export interface MiniMaxChat {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  system_prompt?: string;
}

export interface MiniMaxTextToSpeech {
  model?: string;
  voice_setting?: {
    voice_id: string;
    speed?: number;
    vol?: number;
    pitch?: number;
    emotion?: string;
  };
  audio_setting?: {
    sample_rate?: number;
    bitrate?: number;
    format?: 'mp3' | 'wav' | 'flac' | 'pcm';
    channel?: number;
  };
  language_boost?: string;
  pronunciation_dict?: {tone: string[]};
  voice_modify?: {
    pitch?: number;
    intensity?: number;
    timbre?: number;
    sound_effects?: string;
  };
  subtitle_enable?: boolean;
}

export type MiniMax = true | (MiniMaxChat & {textToSpeech?: true | MiniMaxTextToSpeech});
