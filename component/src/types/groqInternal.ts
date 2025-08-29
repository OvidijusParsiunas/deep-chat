export type GroqToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type GroqMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type GroqRequestBody = {
  model: string;
  messages: GroqMessage[];
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
  seed?: number;
  tools?: object[];
  tool_choice?: 'none' | 'auto' | 'required' | {type: 'function'; function: {name: string}};
  stream?: boolean;
};

export type GroqTextToSpeechRequestBody = {
  model: string;
  input: string;
  voice?: string;
  speed?: number;
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
};