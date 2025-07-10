// https://docs.anthropic.com/en/api/messages
export interface Claude {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  system_prompt?: string;
  stream?: boolean;
}
