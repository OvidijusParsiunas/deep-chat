import {RequestInterceptor} from './requestInterceptor';
import {RequestSettings} from './requestSettings';
import {FilesServiceConfig} from './fileService';
import {CameraFiles} from './camera';

export interface CustomServiceConfig {
  request: RequestSettings;
  stream?: boolean;
  images?: boolean | FilesServiceConfig;
  camera?: boolean | FilesServiceConfig<CameraFiles>;
  audio?: boolean | FilesServiceConfig;
  anyFiles?: boolean | FilesServiceConfig;
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
