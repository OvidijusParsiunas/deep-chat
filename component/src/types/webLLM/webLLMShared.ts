export interface ConvTemplateConfig {
  system: string;
  roles: Array<string>;
  seps: Array<string>;
  separator_style: string;
  offset: number;
  stop_str: string;
  add_bos: boolean;
}

export interface ChatConfig {
  local_id: string;
  model_lib: string;
  tokenizer_files: Array<string>;
  conv_config?: Partial<ConvTemplateConfig>;
  conv_template: string;
  mean_gen_len: number;
  shift_fill_factor: number;
  repetition_penalty: number;
  top_p: number;
  temperature: number;
}

export interface ModelRecord {
  model_url: string;
  local_id: string;
  required_features?: Array<string>;
}

export interface AppConfig {
  model_list: Array<ModelRecord>;
  model_lib_map: Record<string, string>;
}

export declare const prebuiltAppConfig: AppConfig;

export type ChatOptions = Partial<ChatConfig>;

export interface InitProgressReport {
  progress: number;
  timeElapsed: number;
  text: string;
}

export type InitProgressCallback = (report: InitProgressReport) => void;

export type GenerateProgressCallback = (step: number, currentMessage: string) => void;

export interface ChatInterface {
  setInitProgressCallback: (initProgressCallback: InitProgressCallback) => void;

  reload: (localIdOrUrl: string, chatOpts?: ChatOptions, appConfig?: AppConfig) => Promise<void>;

  generate: (input: string, progressCallback?: GenerateProgressCallback, streamInterval?: number) => Promise<string>;

  runtimeStatsText: () => Promise<string>;

  interruptGenerate: () => void;

  unload: () => Promise<void>;

  resetChat: () => Promise<void>;
}
