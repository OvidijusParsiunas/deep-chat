/* eslint-disable @typescript-eslint/no-explicit-any */
import {GenericObject} from './object';

export interface Request {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  additionalBodyProps?: GenericObject<any>;
}
