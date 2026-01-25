export interface DifyChat {
  inputs?: Record<string, unknown>;
  user?: string;
  files?: {type: 'file' | 'collection'; id: string}[];
}

export type Dify = true | DifyChat;
