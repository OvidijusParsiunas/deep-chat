import {AtlasCloudToolCall} from './atlasCloudInternal';

export type AtlasCloudImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type AtlasCloudResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: AtlasCloudToolCall[];
      images?: AtlasCloudImageContent[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

// Atlas Cloud reports errors as {code, msg} (e.g. {"code":400,"msg":"..."}),
// not the OpenAI-style {error: {message, type}} shape.
export type AtlasCloudErrorResponse = {
  code: number;
  msg: string;
};

export type AtlasCloudStreamEvent = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      images?: AtlasCloudImageContent[];
      tool_calls?: AtlasCloudToolCall[];
    };
    finish_reason?: string;
  }>;
  message?: {
    role: 'assistant';
    content: string | null;
    tool_calls?: AtlasCloudToolCall[];
    images?: AtlasCloudImageContent[];
  };
};

export type AtlasCloudAPIResult = AtlasCloudResponse | AtlasCloudStreamEvent | AtlasCloudErrorResponse;
