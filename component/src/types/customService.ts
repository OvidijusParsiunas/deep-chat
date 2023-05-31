import {CameraFilesServiceConfig, FilesServiceConfig, RecordAudioFilesServiceConfig} from './fileServiceConfigs';
import {RequestInterceptor, ResponseInterceptor} from './interceptors';
import {RequestSettings} from './requestSettings';
import {MessageLimits} from './chatLimits';
import {Result} from './result';
import {Demo} from './demo';

export type CustomServiceConfig = {
  request?: RequestSettings;
  stream?: boolean;
  images?: boolean | FilesServiceConfig;
  audio?: boolean | FilesServiceConfig;
  mixedFiles?: boolean | FilesServiceConfig;
  camera?: boolean | CameraFilesServiceConfig;
  microphoneAudio?: boolean | RecordAudioFilesServiceConfig;
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  demo?: Demo;
  [key: string]: unknown;
} & MessageLimits; // total_messages_max_char_length only applies when no files

export interface CustomServiceResponse {
  result?: Result;
  error?: string;
}
