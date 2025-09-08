import {MistralToolCall} from './mistralInternal';

export type MistralResult = {
  choices: [
    {
      message?: {
        role: string;
        content: string | null;
        tool_calls?: MistralToolCall[];
      };
      delta?: {
        role?: string;
        content?: string;
        tool_calls?: MistralToolCall[];
      };
      finish_reason?: string;
    },
  ];
  message?: string;
  detail?: string;
  error?: {message: string};
};
