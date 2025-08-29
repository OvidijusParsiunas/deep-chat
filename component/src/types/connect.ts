/* eslint-disable @typescript-eslint/no-explicit-any */
import {GenericObject} from './object';
import {Handler} from './handler';
import {Stream} from './stream';

export interface Connect {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  credentials?: 'same-origin' | 'include' | 'omit';
  additionalBodyProps?: GenericObject<any>;
  stream?: Stream;
  websocket?: boolean | string | string[];
  handler?: Handler;
}
