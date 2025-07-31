// https://platform.moonshot.ai/docs/api/chat#chat-completion
export type KimiMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type KimiRequestBody = {
  model: string;
  messages: KimiMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
};
