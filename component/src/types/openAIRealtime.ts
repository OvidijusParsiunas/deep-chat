import {ButtonStyles} from './button';
import {CustomStyle} from './styles';

export type OpenAIRealtimeFunctionHandler = (details: {name: string; arguments: string}) => object | Promise<object>;

export type OpenAIRealtimeConfig = {
  model?: string;
  instructions?: string;
  voice?: string;
  temperature?: number;
  max_response_output_tokens?: number | 'inf';
  turn_detection?: {
    type?: string;
    threshold?: string;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  };
  tools?: {
    type: 'function' | 'code_interpreter' | 'file_search';
    name?: string;
    description?: string;
    parameters?: object;
  }[];
  tool_choice?: string;
  function_handler?: OpenAIRealtimeFunctionHandler;
};

export type OpenAIRealtimeLoading = {
  text?: string;
  html?: string;
  display?: boolean;
  style?: CustomStyle;
};

export type OpenAIRealtimeError = {
  text?: string;
  style?: CustomStyle;
};

export type OpenAIRealtimeButton = {
  default?: ButtonStyles;
  active?: ButtonStyles;
  unavailable?: ButtonStyles;
};

export type OpenAIRealtimeButtons = {
  container?: CustomStyle;
  microphone?: OpenAIRealtimeButton;
  toggle?: OpenAIRealtimeButton;
};

export type OpenAIRealtimeAvatar = {
  src?: string;
  maxScale?: number;
  styles?: {
    container?: CustomStyle;
    avatar?: CustomStyle;
  };
};

// https://platform.openai.com/docs/api-reference/realtime
export type OpenAIRealTime = {
  avatar?: OpenAIRealtimeAvatar;
  buttons?: OpenAIRealtimeButtons;
  autoStart?: boolean;
  ephemeralKey?: string;
  fetchEphemeralKey?: () => string | Promise<string>;
  autoFetchEphemeralKey?: boolean;
  config?: OpenAIRealtimeConfig;
  error?: OpenAIRealtimeError;
  loading?: OpenAIRealtimeLoading;
};
