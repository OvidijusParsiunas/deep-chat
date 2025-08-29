// https://docs.together.ai/reference/audio-speech
export type TogetherTextToSpeech = {
  model?: string;
  voice?: string;
  speed?: number;
};

// https://docs.together.ai/reference/post-images-generations
export type TogetherImages = {
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  n?: number;
  seed?: number;
  response_format?: 'url' | 'base64';
};

// https://docs.together.ai/reference/chat-completions-1
export type TogetherChat = {
  system_prompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  stop?: string[];
};

export interface Together {
  chat?: true | TogetherChat;
  images?: true | TogetherImages;
  textToSpeech?: true | TogetherTextToSpeech;
}
