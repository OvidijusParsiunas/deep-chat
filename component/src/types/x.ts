export interface XImages {
  model?: string;
  n?: number;
  size?: string;
}

export interface XChat {
  model?: string;
  max_output_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface X {
  chat?: true | XChat;
  images?: true | XImages;
}
