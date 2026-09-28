import {ChatCompletionsChat} from './chatCompletions';

export interface RequestyReasoning {
  effort?: 'low' | 'medium' | 'high';
  max_tokens?: number;
  exclude?: boolean;
  enabled?: boolean;
}

// https://docs.requesty.ai/
export interface RequestyChat extends ChatCompletionsChat {
  models?: string[];
  reasoning?: RequestyReasoning;
}

export type Requesty = true | RequestyChat;
