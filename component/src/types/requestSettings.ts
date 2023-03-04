import {GenericObject} from './object';

export interface RequestSettings {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
}
