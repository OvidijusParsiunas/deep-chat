export interface GrokImages {
  model?: string;
  prompt?: string;
  n?: number;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  style?: 'vivid' | 'natural';
}

export interface GrokChat {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface Grok {
  chat?: true | GrokChat;
  images?: true | GrokImages;
}
