import {GenericObject} from './object';

export interface GeminiGeneration {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  responseSchema?: GenericObject;
}

// https://ai.google.dev/api/rest/v1beta/models/generateContent
export interface GeminiChat extends GeminiGeneration {
  model?: string;
  stream?: boolean;
  systemInstruction?: string;
}

export interface Gemini {
  chat?: true | GeminiChat;
}
