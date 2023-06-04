import {Result} from './result';
import {Demo} from './demo';

export type CustomServiceConfig = {
  stream?: boolean;
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  demo?: Demo;
};

export interface CustomServiceResponse {
  result?: Result;
  error?: string;
}
