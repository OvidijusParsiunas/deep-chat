import {CameraFilesServiceConfig, FilesServiceConfig, MicrophoneFilesServiceConfig} from '../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../types/validateMessageBeforeSending';
import {Messages} from '../views/chat/messages/messages';
import {InterfacesUnion} from '../types/utilityTypes';
import {FILE_TYPES} from '../types/fileTypes';
import {Request} from '../types/request';
import {Result} from '../types/result';
import {DeepChat} from '../deepChat';
import {Demo} from '../types/demo';

export interface RequestContents {
  text?: string;
  files?: File[];
}

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
  onSuccess: () => void;
  onFail: (message: string) => void;
  onLoad: () => void;
}

export type FileServiceIO = FilesServiceConfig & {infoModalTextMarkUp?: string};

export type CustomErrors = string[];

export type ServiceFileTypes = {
  [key in FILE_TYPES]?: FileServiceIO;
};

export interface ServiceIO {
  key?: string;

  validateConfigKey: boolean;

  insertKeyPlaceholderText?: string;

  getKeyLink?: string;

  url?: string;

  websocket?: WebSocket;

  // overwrites textInput disabled property if not provided
  isTextInputDisabled?: boolean;

  // overwrites textInput placeholderText property if not provided
  textInputPlaceholderText?: string;

  fileTypes: ServiceFileTypes;

  camera?: CameraFilesServiceConfig;

  recordAudio?: MicrophoneFilesServiceConfig;

  requestSettings: Request;

  introPanelMarkUp?: string;

  // the reason why we use a Set of prefixes to allow certain errors is because some errors can change
  // depending on the input e.g. incorrect image dimensions or formatting, hence we identify the permitted
  // service errors via prefixes
  permittedErrorPrefixes?: CustomErrors;

  canSendMessage: ValidateMessageBeforeSending;

  verifyKey(key: string, keyVerificationHandlers: KeyVerificationHandlers): void;

  // prettier-ignore
  callAPI(requestContents: RequestContents, messages: Messages,
    completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers): void;

  extractResultData?(result: object): Promise<InterfacesUnion<Result | {pollingInAnotherRequest: true}>>;

  extractPollResultData?(result: object): PollResult;

  demo?: Demo;

  deepChat: DeepChat; // this is used for interceptors as the user may pass them much later after component is initiated
}
