import {MessageFiles} from './messageFile';

export interface Response {
  text?: string;
  files?: MessageFiles;
  html?: string;
  error?: string;
  role?: string;
  streamOverwrite?: boolean;
  _sessionId?: string;
}
