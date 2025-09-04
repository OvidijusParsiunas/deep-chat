// https://platform.moonshot.ai/docs/api/chat#chat-completion
export type KimiToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type KimiImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type KimiTextContent = {
  type: 'text';
  text: string;
};

export type KimiContent = KimiTextContent | KimiImageContent;

export type KimiMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | KimiContent[] | null;
  tool_calls?: KimiToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type KimiTool = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
};

export type KimiRequestBody = {
  model: string;
  messages: KimiMessage[];
  tools?: KimiTool[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
};
