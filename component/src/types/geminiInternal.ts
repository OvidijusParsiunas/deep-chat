export type GeminiContent = {
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
    functionResponse?: {
      name: string;
      response: object;
    };
  }[];
  role?: string;
};

export type GeminiTool = {
  functionDeclarations: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: object;
      required?: string[];
    };
  }[];
};

export type GeminiRequestBody = {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: {text: string}[];
  };
  tools?: GeminiTool[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    responseMimeType?: string;
    responseSchema?: object;
  };
};
