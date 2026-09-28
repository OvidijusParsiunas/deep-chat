import {ChatCompletionsChat} from './chatCompletions';

export interface OpenRouterReasoning {
  effort?: 'low' | 'medium' | 'high';
  max_tokens?: number;
  exclude?: boolean;
  enabled?: boolean;
}

// https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request
export interface OpenRouterChat extends ChatCompletionsChat {
  models?: string[];
  reasoning?: OpenRouterReasoning;
}

export type OpenRouter = true | OpenRouterChat;
