export interface DeepChatTextRequestBody {
  messages: {role: string; text: string}[];
}

// model is added for OpenAI requests - check this file in the example ui project:
// https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/src/App.tsx
export type DeepChatOpenAITextRequestBody = DeepChatTextRequestBody & {model?: string};
