export interface MistralToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface MistralContentItem {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: string;
}

export interface MistralMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | MistralContentItem[] | null;
  tool_calls?: MistralToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface MistralRequestBody {
  model: string;
  messages: MistralMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  random_seed?: number;
  n?: number;
  safe_mode?: boolean;
  reasoning_mode?: string;
  presence_penalty?: number;
  frequency_penalty?: number;
  tools?: {type: 'function'; function: {name: string; description?: string; parameters: object}}[];
  tool_choice?: 'auto' | 'any' | 'none' | {type: 'function'; function: {name: string}};
  stream?: boolean;
}