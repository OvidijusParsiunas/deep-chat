import {RequestInterceptor, ResponseInterceptor} from './interceptors';
import {GenericObject} from './object';

export interface RequestSettings {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
}

export interface ServiceCallConfig {
  request?: RequestSettings;
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
}
