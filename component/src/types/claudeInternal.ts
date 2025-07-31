export type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ClaudeRequestBody = {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
  stream?: boolean;
};
