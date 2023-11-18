export interface WebModelConfig {
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
