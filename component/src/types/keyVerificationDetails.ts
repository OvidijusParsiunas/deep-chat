import {GenericObject} from './object';

export interface KeyVerificationDetails {
  url: string;
  method: string;
  body?: string;
  createHeaders?: (key: string) => GenericObject<string>;
  handleVerificationResult: (
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) => void;
}
