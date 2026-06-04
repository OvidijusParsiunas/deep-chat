// Local copy of the subset of @mlc-ai/web-llm (MLCEngine / OpenAI-style API) types that
// Deep Chat relies on. Kept here so the component can be built without the package installed;
// the actual implementation is provided at runtime via window.webLLM (deep-chat-web-llm).

export interface InitProgressReport {
  progress: number;
  timeElapsed: number;
  text: string;
}

export type InitProgressCallback = (report: InitProgressReport) => void;

// Partial ChatConfig - only the override fields Deep Chat may set.
export interface ChatOptions {
  context_window_size?: number;
  sliding_window_size?: number;
  conv_config?: {system_message?: string; [key: string]: unknown};
  temperature?: number;
  top_p?: number;
  [key: string]: unknown;
}

export interface ModelRecord {
  model: string;
  model_id: string;
  model_lib: string;
  overrides?: ChatOptions;
  vram_required_MB?: number;
  low_resource_required?: boolean;
  required_features?: Array<string>;
}

export type CacheBackend = 'cache' | 'indexeddb' | 'cross-origin' | 'opfs';

export interface AppConfig {
  model_list: Array<ModelRecord>;
  cacheBackend?: CacheBackend;
}

export interface MLCEngineConfig {
  appConfig?: AppConfig;
  initProgressCallback?: InitProgressCallback;
  logLevel?: string;
}

// OpenAI-style chat message
export interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  messages: Array<ChatCompletionMessageParam>;
  stream?: boolean | null;
  stream_options?: {include_usage?: boolean} | null;
  model?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  top_p?: number | null;
}

export interface ChatCompletionChunk {
  id: string;
  model: string;
  choices: Array<{
    delta: {content?: string | null; role?: string};
    index: number;
    finish_reason?: string | null;
  }>;
}

export interface ChatCompletion {
  id: string;
  model: string;
  choices: Array<{
    message: {role: string; content: string | null};
    index: number;
    finish_reason?: string | null;
  }>;
}

export interface ChatCompletionsAPI {
  create(request: ChatCompletionRequest & {stream: true}): Promise<AsyncIterable<ChatCompletionChunk>>;
  create(request: ChatCompletionRequest): Promise<ChatCompletion>;
}

// The runtime engine interface (implemented by both MLCEngine and WebWorkerMLCEngine).
export interface MLCEngineInterface {
  chat: {completions: ChatCompletionsAPI};
  setInitProgressCallback: (initProgressCallback: InitProgressCallback) => void;
  setAppConfig: (appConfig: AppConfig) => void;
  reload: (modelId: string | string[], chatOpts?: ChatOptions | ChatOptions[]) => Promise<void>;
  interruptGenerate: () => void;
  unload: () => Promise<void>;
  resetChat: (keepStats?: boolean, modelId?: string) => Promise<void>;
  runtimeStatsText: (modelId?: string) => Promise<string>;
}

export declare function deleteModelAllInfoInCache(modelId: string, appConfig?: AppConfig): Promise<void>;

export declare const prebuiltAppConfig: AppConfig;
