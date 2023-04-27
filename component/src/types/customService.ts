import {CameraFilesServiceConfig, FilesServiceConfig} from './fileService';
import {RequestInterceptor, ResponseInterceptor} from './interceptors';
import {RequestSettings} from './requestSettings';
import {Result} from './result';

export interface CustomServiceConfig {
  request: RequestSettings;
  stream?: boolean;
  images?: boolean | FilesServiceConfig;
  camera?: boolean | CameraFilesServiceConfig;
  audio?: boolean | FilesServiceConfig;
  mixedFiles?: boolean | FilesServiceConfig;
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  result: Result;
  error: string;
}
