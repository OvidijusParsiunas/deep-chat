import {ChatFunctionHandler} from './openAI';

export interface AtlasCloudTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export type AtlasCloudToolChoice = 'auto' | 'none' | 'required' | {type: 'function'; function: {name: string}};

export interface AtlasCloudResponseFormat {
  type: 'text' | 'json_object' | 'json_schema';
  json_schema?: {
    name: string;
    description?: string;
    schema: object;
    strict?: boolean;
  };
}

// https://www.atlascloud.ai/
export interface AtlasCloudChat {
  model?: string;
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
  system_prompt?: string;
  tools?: AtlasCloudTool[];
  tool_choice?: AtlasCloudToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: AtlasCloudResponseFormat;
  function_handler?: ChatFunctionHandler;
}

export type AtlasCloud = true | AtlasCloudChat;
