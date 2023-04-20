import {RequestSettings, ServiceRequestConfig} from './requestSettings';
import {RequestInterceptor} from './requestInterceptor';
import {FileAttachments} from './fileAttachments';

export type FilesServiceConfig = ServiceRequestConfig & {files?: FileAttachments};

export interface CustomServiceConfig {
  request: RequestSettings;
  stream?: boolean;
  images?: boolean | FilesServiceConfig;
  interceptor?: RequestInterceptor;
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  aiMessage: string;
  error: string;
}
