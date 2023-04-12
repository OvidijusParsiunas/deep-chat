import {RequestSettings} from '../types/requestSettings';
import {Messages} from '../views/chat/messages/messages';

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

export interface ServiceIO<Result = object> {
  url?: string;
  requestSettings?: RequestSettings;

  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers): void;

  preprocessBody(body: object, messages: Messages): object;

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers): void;

  extractTextFromResult(result: Result): string;
}
