import {MessageFiles} from './messageFile';

export interface Response {
  text?: string;
  files?: MessageFiles;
  html?: string;
  error?: string;
  role?: string;
  overwrite?: boolean;
  _sessionId?: string;
}
