export type QwenContent = 
  | {type: 'text'; text: string}
  | {type: 'image_url'; image_url: {url: string}};

export type QwenToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type QwenMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | QwenContent[] | null;
  tool_calls?: QwenToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type QwenTool = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
};

export type QwenRequestBody = {
  model: string;
  messages: QwenMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  tools?: QwenTool[];
  tool_choice?: 'auto' | 'none' | {type: 'function'; function: {name: string}};
};