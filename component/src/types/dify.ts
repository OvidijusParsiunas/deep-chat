export interface DifyChat {
  inputs?: Record<string, unknown>;
  user?: string;
  files?: {type: 'file' | 'collection'; id: string}[];
}

export interface Dify {
  chat?: DifyChat;
}

export interface DifyBlockingResponse {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  created_at?: number;
  code?: string;
  message?: string;
}

export interface DifyFileInput {
  type: 'image' | 'document' | 'audio' | 'video';
  transfer_method: 'local_file' | 'remote_url';
  upload_file_id: string;
}

export enum DifyResponseMode {
  BLOCKING = 'blocking',
  STREAMING = 'streaming',
}

export enum DifyStreamEvent {
  MESSAGE = 'message', // Standard text chunk
  AGENT_MESSAGE = 'agent_message', // Text chunk when using Agent mode
  AGENT_THOUGHT = 'agent_thought', // Reasoning steps (COT)
  MESSAGE_END = 'message_end',
  MESSAGE_REPLACE = 'message_replace',
  WORKFLOW_FINISHED = 'workflow_finished',
  ERROR = 'error',
  PING = 'ping',
}

export interface DifyUploadConfig {
  url: string;
  user: string;
  headers: Record<string, string>;
}
