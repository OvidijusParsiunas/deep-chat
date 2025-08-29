import {MessageFiles} from './messageFile';

export interface Response {
  text?: string;
  files?: MessageFiles;
  html?: string;
  error?: string;
  role?: string;
  overwrite?: boolean;
  // eslint-disable-next-line
  custom?: any;
  _sessionId?: string;
}
