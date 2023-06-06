/* eslint-disable @typescript-eslint/no-explicit-any */
import {GenericObject} from './object';

export interface RequestSettings {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  body?: GenericObject<any>;
}
