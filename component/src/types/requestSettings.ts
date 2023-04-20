import {RequestInterceptor} from './requestInterceptor';
import {GenericObject} from './object';

export interface RequestSettings {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
}

export interface ServiceRequestConfig {
  request?: RequestSettings;
  interceptor?: RequestInterceptor;
}
