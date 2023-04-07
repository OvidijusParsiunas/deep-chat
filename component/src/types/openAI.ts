// https://platform.openai.com/docs/api-reference/chat/create
// https://platform.openai.com/docs/api-reference/completions
export interface OpenAIConfig {
  // make this optional as users may just to want to set stream to false
  model: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAI {
  chat?: OpenAIConfig | true;
  completions?: OpenAIConfig | true;
}
