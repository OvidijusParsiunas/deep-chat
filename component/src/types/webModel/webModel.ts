export type WebModelName =
  // Llama-2
  | 'Llama-2-7b-chat-hf-q4f32_1'
  | 'Llama-2-7b-chat-hf-q4f16_1'
  | 'Llama-2-7b-chat-hf-q4f16_1-1k'
  | 'Llama-2-13b-chat-hf-q4f16_1'
  | 'Llama-2-70b-chat-hf-q4f16_1'
  // RedPajama
  | 'RedPajama-INCITE-Chat-3B-v1-q4f16_1'
  | 'RedPajama-INCITE-Chat-3B-v1-q4f32_1'
  | 'RedPajama-INCITE-Chat-3B-v1-q4f16_1-1k'
  | 'RedPajama-INCITE-Chat-3B-v1-q4f32_1-1k'
  // Mistral variants
  | 'WizardMath-7B-V1.1-q4f16_1'
  | 'Mistral-7B-Instruct-v0.2-q4f16_1'
  | 'OpenHermes-2.5-Mistral-7B-q4f16_1'
  | 'NeuralHermes-2.5-Mistral-7B-q4f16_1'
  // TinyLlama
  | 'TinyLlama-1.1B-Chat-v0.4-q0f16'
  | 'TinyLlama-1.1B-Chat-v0.4-q0f32'
  | 'TinyLlama-1.1B-Chat-v0.4-q4f16_1-1k'
  | 'TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k';

export interface WebModelIntro {
  displayed?: boolean;
  initialHtml?: string;
  downloadClass?: string;
  uploadClass?: string;
  fileInputClass?: string;
  afterLoadHtml?: string;
  exportFilesClass?: string;
  removeAfterLoad?: boolean;
  removeAfterMessage?: boolean;
  autoScroll?: boolean;
}

export interface WebModelLoad {
  onInit?: boolean;
  onMessage?: boolean;
  clearCache?: boolean;
  skipCache?: boolean;
}

export interface WebModelUrls {
  model?: string;
  wasm?: string;
}

export interface WebModelConfig {
  model?: WebModelName;
  instruction?: string;
  urls?: WebModelUrls;
  load?: WebModelLoad;
  introMessage?: WebModelIntro;
  worker?: Worker;
}

export type WebModel = boolean | WebModelConfig;
