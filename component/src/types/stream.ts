export type StreamWrappers = {default?: string; ai?: string} & {[name: string]: string};

export interface StreamConfig {
  simulation?: boolean | number | string;
  readable?: boolean;
  partialRender?: boolean;
  htmlWrappers?: StreamWrappers;
}

export type Stream = boolean | StreamConfig;
