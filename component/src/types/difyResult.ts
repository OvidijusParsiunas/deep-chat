export interface DifyBlockingResponse {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  created_at?: number;
  code?: string;
  message?: string;
}

export enum DifyStreamEvent {
  MESSAGE = 'message',
  AGENT_MESSAGE = 'agent_message',
  WORKFLOW_FINISHED = 'workflow_finished',
  ERROR = 'error',
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

export interface UploadResponse {
  id: string;
}
