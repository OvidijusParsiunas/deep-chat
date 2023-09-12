import {Response} from './response';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (body: any) => Promise<Response>;

export interface StreamEvents {
  onOpen: () => void;
  onResult: (result: {text?: string; error?: string}) => void;
  onClose: () => void;
  stopClicked: {listener: () => void};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StreamHandler = (body: any, events: StreamEvents) => void;
