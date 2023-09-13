/* eslint-disable @typescript-eslint/no-explicit-any */
import {Response} from './response';

export interface Signals {
  onOpen?: () => void;
  onClose?: () => void;
  onResponse: (response: Response) => void;
  stopClicked?: {listener: () => void};
  newUserMessage?: {listener: (body: any) => void};
}

export type Handler = (body: any, signals: Signals) => void;
