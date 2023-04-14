import {RequestSettings} from '../types/requestSettings';
import {Messages} from '../views/chat/messages/messages';
import {ImageResults} from '../types/imageResult';

export interface CompletionsHandlers {
  onFinish: () => void;
}

export interface StreamHandlers {
  onOpen: () => void;
  onClose: () => void;
  abortStream: AbortController;
}

export interface KeyVerificationHandlers {
  onSuccess: (key: string) => void;
  onFail: (message: string) => void;
  onLoad: () => void;
}

export interface ServiceIO {
  url?: string;
  requestSettings?: RequestSettings;

  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers): void;

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers): void;

  extractResultData(result: object): string | ImageResults;
}
