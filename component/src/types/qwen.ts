// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export interface Qwen {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  system_prompt?: string;
}
