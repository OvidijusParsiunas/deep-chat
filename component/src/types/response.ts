import {MessageFiles} from './messageFile';

export interface Response {
  text?: string;
  files?: MessageFiles;
  error?: string;
}
