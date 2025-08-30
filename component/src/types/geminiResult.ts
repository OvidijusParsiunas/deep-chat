// https://ai.google.dev/api/rest/v1beta/models/generateContent
interface GeminiContent {
  parts: {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
    functionCall?: {
      name: string;
      args: object;
    };
  }[];
  role?: string;
}

export interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
  index?: number;
  safetyRatings?: {category: string; probability: string}[];
}

export interface GeminiGenerateContentResult {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    safetyRatings?: {category: string; probability: string}[];
  };
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}
