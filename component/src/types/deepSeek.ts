// https://api-docs.deepseek.com/api/create-chat-completion
export interface DeepSeek {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  system_prompt?: string;
}
