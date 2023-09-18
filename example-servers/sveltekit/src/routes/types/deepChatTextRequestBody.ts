import type {MessageContent} from 'deep-chat/dist/types/messages';

export interface DeepChatTextRequestBody {
  messages: MessageContent[];
}

// model is added for OpenAI requests - check this file in the example ui project:
// https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/src/App.tsx
export type DeepChatOpenAITextRequestBody = DeepChatTextRequestBody & {model?: string};
