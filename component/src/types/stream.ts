export interface StreamConfig {
  simulation?: boolean | number | string;
  readable?: boolean;
  partialRender?: boolean;
}

export type Stream = boolean | StreamConfig;
