export type DifyFileType = 'image' | 'document' | 'audio' | 'video' | 'file';

export interface DifyFileInput {
  type: DifyFileType;
  transfer_method: 'local_file' | 'remote_url';
  upload_file_id: string;
}

export enum DifyResponseMode {
  BLOCKING = 'blocking',
  STREAMING = 'streaming',
}

export interface DifyUploadConfig {
  url: string;
  user: string;
  headers: Record<string, string>;
}

export interface DifyRequestBody {
  inputs: Record<string, unknown>;
  query: string;
  response_mode: string;
  user: string;
  conversation_id?: string;
  files?: DifyFileInput[];
}
