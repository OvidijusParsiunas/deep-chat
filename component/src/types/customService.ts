import {RequestInterceptor} from './requestInterceptor';
import {RequestSettings} from './requestSettings';
import {FilesServiceConfig} from './fileService';

export interface CustomServiceConfig {
  request: RequestSettings;
  stream?: boolean;
  images?: boolean | FilesServiceConfig;
  audio?: boolean | FilesServiceConfig;
  interceptor?: RequestInterceptor;
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  // TO-DO - insert a type called others which would allow all types to be inserted
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  aiMessage: string;
  error: string;
}
