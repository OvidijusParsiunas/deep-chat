export interface StreamConfig {
  simulation?: boolean | number | string;
  readable?: boolean;
}

export type Stream = boolean | StreamConfig;
