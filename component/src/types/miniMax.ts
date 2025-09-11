// https://docs.spring.io/spring-ai/reference/api/chat/minimax-chat.html
export interface MiniMax {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  system_prompt?: string;
}