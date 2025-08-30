export type BigModelTextContent = {
  type: 'text';
  text: string;
};

export type BigModelImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type BigModelVideoContent = {
  type: 'video_url';
  video_url: {
    url: string;
  };
};

export type BigModelFileContent = {
  type: 'file';
  file_url: {
    url: string;
  };
};

export type BigModelContentItem = BigModelTextContent | BigModelImageContent | BigModelVideoContent | BigModelFileContent;

export type BigModelToolCall = {
  function: {
    name: string;
    arguments: string;
  };
  id: string;
  type: string;
};

export type BigModelToolMessage = {
  role: 'tool';
  tool_call_id: string;
  name: string;
  content: string;
};

export type BigModelAssistantMessage = {
  role: 'assistant';
  content: string | null;
  tool_calls?: BigModelToolCall[];
};

export type BigModelUserMessage = {
  role: 'user';
  content: string | BigModelContentItem[];
};

export type BigModelSystemMessage = {
  role: 'system';
  content: string;
};

export type BigModelMessage = BigModelSystemMessage | BigModelUserMessage | BigModelAssistantMessage | BigModelToolMessage;

export type BigModelTool = {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: object;
  };
};

export type BigModelRequestBody = {
  model: string;
  messages: BigModelMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  tools?: BigModelTool[];
  tool_choice?: 'auto' | {type: 'function'; function: {name: string}};
};

export type BigModelImagesRequestBody = {
  model: string;
  prompt: string;
};

export type BigModelTextToSpeechRequestBody = {
  model: string;
  input: string;
  voice?: string;
};
