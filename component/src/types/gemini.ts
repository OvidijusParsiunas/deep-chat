import {ChatFunctionHandler} from './openAI';
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
export interface Gemini extends GeminiGeneration {
  model?: string;
  systemInstruction?: string;
  function_handler?: ChatFunctionHandler;
  tools?: {
    functionDeclarations: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: object;
        required?: string[];
      };
    }[];
  }[];
}
