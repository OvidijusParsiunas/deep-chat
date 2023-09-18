/* eslint-disable @typescript-eslint/no-explicit-any */
import {GenericObject} from './object';
import {Handler} from './handler';

export interface Request {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  additionalBodyProps?: GenericObject<any>;
  websocket?: boolean | string | string[];
  handler?: Handler;
}
