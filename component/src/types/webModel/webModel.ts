// Commonly-used models from @mlc-ai/web-llm's prebuiltAppConfig (model_id values). Any model_id
// present in window.webLLM.prebuiltAppConfig is also valid - this union just powers autocomplete.
export type WebModelName =
  // Llama 3.x
  | 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
  | 'Llama-3.2-1B-Instruct-q4f32_1-MLC'
  | 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
  | 'Llama-3.1-8B-Instruct-q4f16_1-MLC'
  // Phi
  | 'Phi-3.5-mini-instruct-q4f16_1-MLC'
  | 'Phi-3.5-mini-instruct-q4f16_1-MLC-1k'
  // Qwen
  | 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
  | 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'
  // Gemma
  | 'gemma-2-2b-it-q4f16_1-MLC'
  // Mistral
  | 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC'
  // TinyLlama / SmolLM
  | 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC'
  | 'SmolLM2-1.7B-Instruct-q4f16_1-MLC'
  // any other model_id available in window.webLLM.prebuiltAppConfig (string & {} keeps the
  // literal suggestions above while still permitting any model_id string)
  | (string & {});

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
