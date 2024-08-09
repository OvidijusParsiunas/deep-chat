import {CameraFilesServiceConfig, FilesServiceConfig, MicrophoneFilesServiceConfig} from '../types/fileServiceConfigs';
import {IWebsocketHandler} from '../utils/HTTP/customHandler';
import {Messages} from '../views/chat/messages/messages';
import {InterfacesUnion} from '../types/utilityTypes';
import {FetchFunc} from '../utils/HTTP/requestUtils';
import {FILE_TYPES} from '../types/fileTypes';
import {Response} from '../types/response';
import {Connect} from '../types/connect';
import {Signals} from '../types/handler';
import {Stream} from '../types/stream';
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
  stopClicked: Signals['stopClicked']; // custom stream handler as can't listen to abort when user overwrites it
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

  validateKeyProperty: boolean;

  insertKeyPlaceholderText?: string;

  keyHelpUrl?: string;

  url?: string;

  // 'pending' is used to signify that the websocket connection will need to be established
  // IWebsocketHandler contains logic for custom handler
  websocket?: WebSocket | 'pending' | IWebsocketHandler;

  completionsHandlers: CompletionsHandlers;

  streamHandlers: StreamHandlers;

  // overwrites textInput disabled property if not provided
  isTextInputDisabled?: boolean;

  // overwrites textInput placeholderText property if not provided
  textInputPlaceholderText?: string;

  fileTypes: ServiceFileTypes;

  camera?: CameraFilesServiceConfig;

  recordAudio?: MicrophoneFilesServiceConfig;

  connectSettings: Connect;

  introPanelMarkUp?: string;

  // the reason why we use a set of prefixes to allow certain errors is because some errors can change
  // depending on the input e.g. incorrect image dimensions or formatting, hence we identify the permitted
  // service errors via prefixes
  permittedErrorPrefixes?: CustomErrors;

  canSendMessage: (text?: string, files?: File[], isProgrammatic?: boolean) => boolean;

  verifyKey(key: string, keyVerificationHandlers: KeyVerificationHandlers): void;

  callAPI(requestContents: RequestContents, messages: Messages): Promise<void>;

  extractResultData?(
    result: object,
    fetch?: FetchFunc,
    previousBody?: object
  ): Promise<InterfacesUnion<Response | {makingAnotherRequest: true}>>;

  extractPollResultData?(result: object): PollResult;

  demo?: Demo;

  stream?: Stream;

  deepChat: DeepChat;

  isDirectConnection(): boolean;

  isWebModel(): boolean;

  isSubmitProgrammaticallyDisabled?: boolean;

  sessionId?: string;

  fetchHistory?: () => Promise<Response[]> | Response[];

  // mostly used for streaming to not close the stream when it makes another request
  asyncCallInProgress?: boolean;
}
