import {GenericObject} from './object';

export interface RequestSettings {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  additionalBodyProperties?: Object; // TO-DO check if this type works
}
