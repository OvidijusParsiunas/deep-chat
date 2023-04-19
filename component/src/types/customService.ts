import {FileAttachments} from './fileAttachments';
import {RequestSettings} from './requestSettings';

export interface CustomFileConfig {
  files?: FileAttachments;
  request?: RequestSettings;
}

export interface CustomServiceConfig {
  stream?: boolean;
  images?: boolean | CustomFileConfig;
  request: RequestSettings;
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  aiMessage: string;
  error: string;
}
