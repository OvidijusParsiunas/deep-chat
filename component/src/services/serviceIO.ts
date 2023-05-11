import {CameraFilesServiceConfig, FilesServiceConfig, RecordAudioFilesServiceConfig} from '../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../types/interceptors';
import {RequestSettings} from '../types/requestSettings';
import {Messages} from '../views/chat/messages/messages';
import {InterfacesUnion} from '../types/utilityTypes';
import {FILE_TYPES} from '../types/fileTypes';
import {Result} from '../types/result';

export type PollResult = Promise<InterfacesUnion<Result | {timeoutMS: number}>>;

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

export type FileServiceIO = FilesServiceConfig & {infoModalTextMarkUp?: string};

export type CustomErrors = Set<string>;

export type ServiceFileTypes = {
  [key in FILE_TYPES]?: FileServiceIO;
};

export interface ServiceIO {
  url?: string;

  // overwrites textInput property if not provided
  isTextInputDisabled?: boolean;

  // overwrites textInput property if not provided
  placeholderText?: string;

  fileTypes?: ServiceFileTypes;

  camera?: CameraFilesServiceConfig;

  recordAudio?: RecordAudioFilesServiceConfig;

  requestSettings?: RequestSettings;

  introPanelMarkUp?: string;

  // the reason why we use a Set of prefixes to allow certain errors is because some errors can change
  // depending on the input e.g. incorrect image dimensions or formatting, hence we identify the permitted
  // service errors via prefixes
  permittedErrorPrefixes?: CustomErrors;

  // the reason why requestInterceptor and resposeInterceptor are not optional is so that HTTPRequest would not need
  // to use them as optionals
  requestInterceptor: RequestInterceptor;

  resposeInterceptor: ResponseInterceptor;

  canSendMessage: ValidateMessageBeforeSending;

  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers): void;

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers,
    files?: File[]): void;

  extractResultData?(result: object): Promise<InterfacesUnion<Result | {pollingInAnotherRequest: true}>>;

  extractPollResultData?(result: object): PollResult;
}
