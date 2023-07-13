export interface DeepChatTextRequestBody {
  messages: {role: string; text: string}[];
}

export type DeepChatOpenAITextRequestBody = DeepChatTextRequestBody & {model: string}