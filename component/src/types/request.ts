/* eslint-disable @typescript-eslint/no-explicit-any */
import {CustomServiceResponse} from './customService';
import {GenericObject} from './object';

export interface Request {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  additionalBodyProps?: GenericObject<any>;
  websocket?: boolean | string | string[];
  handler?: (body: any) => Promise<CustomServiceResponse>;
}
