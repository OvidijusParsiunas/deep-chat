export interface DifyChat {
  inputs?: Record<string, unknown>;
  user?: string;
}

export interface Dify {
  chat?: true | DifyChat;
  key?: string;
  url?: string;
  user?: string;
  mode: 'blocking' | 'streaming';
}

export interface DifyBlockingResponse {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  created_at?: number;
}

export interface DifyFileInput {
  type: 'image' | 'document' | 'audio' | 'video';
  transfer_method: 'local_file' | 'remote_url';
  upload_file_id: string;
}
