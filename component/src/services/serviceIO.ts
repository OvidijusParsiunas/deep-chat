import {RequestSettings} from '../types/requestSettings';
import {Messages} from '../views/chat/messages/messages';
import {MessageContent} from '../types/messages';

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

export interface ServiceIO<Body = object, Result = object> {
  url?: string;
  requestSettings?: RequestSettings;
  body?: Body;

  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers): void;

  preprocessBody(body: Body, messages: MessageContent[]): object;

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers): void;

  extractTextFromResult(result: Result): string;
}
