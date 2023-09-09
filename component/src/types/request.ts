/* eslint-disable @typescript-eslint/no-explicit-any */
import {GenericObject} from './object';
import {Result} from './result';

export interface Request {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  additionalBodyProps?: GenericObject<any>;
  websocket?: boolean | string | string[];
  handler?: (body: any) => Promise<Result>;
}
