import {GenericObject} from './object';
import {Result} from './result';

export interface RequestDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  headers?: GenericObject<string>;
}

export type RequestInterceptor = (details: RequestDetails) => RequestDetails;

// not enabled for streaming
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseInterceptor = (response: any) => Result;
