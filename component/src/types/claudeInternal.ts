type ClaudeImageContent = {
  type: 'image';
  source: {
    type: 'base64';
    media_type: string;
    data: string;
  };
};

type ClaudeTextContent = {
  type: 'text';
  text: string;
};

export type ClaudeContent = ClaudeTextContent | ClaudeImageContent;

export type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string | (ClaudeTextContent | ClaudeImageContent)[];
};

export type ClaudeRequestBody = {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
  stream?: boolean;
};
