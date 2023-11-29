export type WebModelName =
  | 'Llama-2-7b-chat-hf-q4f32_1'
  | 'Llama-2-13b-chat-hf-q4f32_1'
  | 'Llama-2-7b-chat-hf-q4f16_1'
  | 'Llama-2-13b-chat-hf-q4f16_1'
  | 'Llama-2-70b-chat-hf-q4f16_1'
  | 'RedPajama-INCITE-Chat-3B-v1-q4f16_1'
  | 'RedPajama-INCITE-Chat-3B-v1-q4f32_1'
  | 'vicuna-v1-7b-q4f32_0'
  | 'WizardCoder-15B-V1.0-q4f16_1'
  | 'WizardCoder-15B-V1.0-q4f32_1'
  | 'WizardMath-7B-V1.0-q4f16_1'
  | 'WizardMath-7B-V1.0-q4f32_1'
  | 'WizardMath-13B-V1.0-q4f16_1'
  | 'WizardMath-70B-V1.0-q4f16_1'
  | 'Mistral-7B-Instruct-v0.1-q4f16_1'
  | 'Mistral-7B-Instruct-v0.1-q4f32_1';

export interface WebModelConfig {
  model?: WebModelName;
  worker?: Worker;
  modelUrl?: string;
  wasmUrl?: string;
  load?: {
    onInit?: boolean;
    onMessage?: boolean;
  };
  initialMessage?: {
    displayed?: boolean;
    html?: string;
    downloadClass?: string;
  };
}

export type WebModel = boolean | WebModelConfig;
