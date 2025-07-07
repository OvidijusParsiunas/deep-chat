import {GenericObject} from './object';

export interface GeminiGenerationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  responseSchema?: GenericObject;
}

// https://ai.google.dev/api/rest/v1beta/models/generateContent
export interface GeminiChatConfig extends GeminiGenerationConfig {
  model?: string;
  stream?: boolean;
  systemInstruction?: string;
}

export type GeminiChat = GeminiChatConfig;

export interface Gemini {
  chat?: true | GeminiChatConfig;
}
