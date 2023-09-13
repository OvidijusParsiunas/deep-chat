/* eslint-disable @typescript-eslint/no-explicit-any */
import {Response} from './response';

export interface BasicSignals {
  onResponse: (result: Response) => void;
}

export type Handler = (body: any, signals: BasicSignals) => void;

export interface StreamSignals {
  onOpen: () => void;
  onClose: () => void;
  onResponse: (response: {text?: string; error?: string}) => void;
  stopClicked: {listener: () => void};
}

export type StreamHandler = (body: any, signals: StreamSignals) => void;

export interface WebsocketSignals {
  onOpen: () => void;
  onClose: () => void;
  onResponse: (response: {text?: string; error?: string}) => void;
  newUserMessage: {listener: (body: any) => void};
}

export type WebsocketHandler = (_: undefined, signals: WebsocketSignals) => void;
