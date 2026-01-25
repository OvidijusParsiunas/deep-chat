import {MessageContentI} from '../types/messagesInternal';

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

export interface DifyStreamPayload {
  event: DifyStreamEvent;
  answer?: string;
  conversation_id?: string;
  message?: string;
  data?: {
    outputs?: {
      answer?: string;
    };
  };
}

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

export enum DifyStreamEvent {
  MESSAGE = 'message',
  AGENT_MESSAGE = 'agent_message',
  AGENT_THOUGHT = 'agent_thought',
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

export interface UploadResponse {
  id: string;
}

export interface PreprocessBodyParams {
  msgs: MessageContentI[];
  files?: DifyFileInput[];
  conversationId: string;
  user: string;
  mode: string;
  inputs: Record<string, unknown>;
}

export interface DifyRequestBody {
  inputs: Record<string, unknown>;
  query: string;
  response_mode: string;
  user: string;
  conversation_id?: string;
  files?: DifyFileInput[];
}
