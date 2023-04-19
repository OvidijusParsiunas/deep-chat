import {FileAttachments} from './fileAttachments';

export interface CustomServiceConfig {
  stream?: boolean;
  images?: FileAttachments;
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  aiMessage: string;
  error: string;
}
