import {CameraFilesServiceConfig, FilesServiceConfig, MicrophoneFilesServiceConfig} from '../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../types/validateMessageBeforeSending';
import {Messages} from '../views/chat/messages/messages';
import {InterfacesUnion} from '../types/utilityTypes';
import {FILE_TYPES} from '../types/fileTypes';
import {StreamEvents} from '../types/handler';
import {Response} from '../types/response';
import {Request} from '../types/request';
import {DeepChat} from '../deepChat';
import {Demo} from '../types/demo';

export interface RequestContents {
  text?: string;
  files?: File[];
}

export type PollResult = Promise<InterfacesUnion<Response | {timeoutMS: number}>>;

export interface CompletionsHandlers {
  onFinish: () => void;
}

export interface StreamHandlers {
  onOpen: () => void;
  onClose: () => void;
  abortStream: AbortController;
  stopClicked: StreamEvents['stopClicked']; // custom stream handler as can't listen to abort when user overwrites it
  simulationInterim?: number;
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

  // 'pending' is used to signify that the websocket connection will need to be established
  websocket?: WebSocket | 'pending';

  completionsHandlers: CompletionsHandlers;

  streamHandlers: StreamHandlers;

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

  callAPI(requestContents: RequestContents, messages: Messages): Promise<void>;

  extractResultData?(result: object): Promise<InterfacesUnion<Response | {pollingInAnotherRequest: true}>>;

  extractPollResultData?(result: object): PollResult;

  demo?: Demo;

  deepChat: DeepChat; // this is used for interceptors as the user may pass them much later after component is initiated
}
