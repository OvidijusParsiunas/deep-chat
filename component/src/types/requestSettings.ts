import {RequestInterceptor} from './interceptors';
import {GenericObject} from './object';
import {Result} from './result';

export interface RequestSettings {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
}

export interface ServiceCallConfig {
  request?: RequestSettings;
  requestInterceptor?: RequestInterceptor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseInterceptor?: (response: any) => Result;
}
