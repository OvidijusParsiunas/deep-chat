export interface GrokImages {
  model?: string;
  n?: number;
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
