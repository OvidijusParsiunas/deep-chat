// https://platform.moonshot.ai/docs/api/chat#chat-completion
export interface Kimi {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  system_prompt?: string;
}
