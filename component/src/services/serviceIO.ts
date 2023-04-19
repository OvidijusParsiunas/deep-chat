import {ValidateMessageBeforeSending} from '../types/validateMessageBeforeSending';
import {RequestInterceptor} from '../types/requestInterceptor';
import {RequestSettings} from '../types/requestSettings';
import {Messages} from '../views/chat/messages/messages';
import {CustomFileConfig} from '../types/customService';
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

export type ImagesConfig = CustomFileConfig & {infoModalTextMarkUp?: string};

export interface ServiceIO {
  url?: string;

  images?: ImagesConfig;

  requestSettings?: RequestSettings;

  requestInterceptor: RequestInterceptor;

  canSendMessage: ValidateMessageBeforeSending;

  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers): void;

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers,
    files?: File[]): void;

  extractResultData(result: object): string | ImageResults;
}
