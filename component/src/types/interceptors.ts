import {GenericObject} from './object';
import {Result} from './result';

// WORK - change body to a type
export interface RequestDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  headers?: GenericObject<string>;
}

export type ResponseDetails = RequestDetails | {error: string};

export type RequestInterceptor = (details: RequestDetails) => ResponseDetails | Promise<ResponseDetails>;

// not enabled for streaming
// the response type is subject to what type of connection you are using:
// if you are using a custom service via the 'request' property - see Result
// if you are directly connecting to an API via the 'directConnection' property - the response type will
// dependend to the defined service
// https://deepchat.dev/docs/interceptors#responseInterceptor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseInterceptor = (response: any) => Result | Promise<Result>;
