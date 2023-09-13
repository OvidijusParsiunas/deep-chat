/* eslint-disable @typescript-eslint/no-explicit-any */
import {Handler, StreamHandler, WebsocketHandler} from './handler';
import {GenericObject} from './object';

export interface Request {
  url?: string;
  method?: string;
  headers?: GenericObject<string>;
  additionalBodyProps?: GenericObject<any>;
  websocket?: boolean | string | string[];
  handler?: Handler;
  streamHandler?: StreamHandler;
  websocketHandler?: WebsocketHandler;
}
