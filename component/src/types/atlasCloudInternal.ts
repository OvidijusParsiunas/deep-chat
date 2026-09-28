import {AtlasCloudResponseFormat, AtlasCloudTool, AtlasCloudToolChoice} from './atlasCloud';

export type AtlasCloudToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type AtlasCloudContent = {
  type: 'text' | 'image_url' | 'input_audio';
  text?: string;
  image_url?: {
    url: string;
  };
  input_audio?: {
    data: string;
    format: 'wav' | 'mp3';
  };
};

export type AtlasCloudMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | AtlasCloudContent[] | null;
  tool_calls?: AtlasCloudToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type AtlasCloudRequestBody = {
  model: string;
  messages: AtlasCloudMessage[];
  tools?: AtlasCloudTool[];
  tool_choice?: AtlasCloudToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: AtlasCloudResponseFormat;
  stream?: boolean;
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
};
