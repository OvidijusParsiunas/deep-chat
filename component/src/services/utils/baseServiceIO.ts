import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {ValidateInput} from '../../types/validateInput';
import {ResponseI} from '../../types/responseInternal';
import {MessageLimitUtils} from './messageLimitUtils';
import {Websocket} from '../../utils/HTTP/websocket';
import {Legacy} from '../../utils/legacy/legacy';
import {Stream} from '../../utils/HTTP/stream';
import {Demo as DemoT} from '../../types/demo';
import {Response} from '../../types/response';
import {Request} from '../../types/request';
import {SetFileTypes} from './setFileTypes';
import {Demo} from '../../utils/demo/demo';
import {DeepChat} from '../../deepChat';
import {
  KeyVerificationHandlers,
  CompletionsHandlers,
  ServiceFileTypes,
  RequestContents,
  StreamHandlers,
  ServiceIO,
} from '../serviceIO';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BaseServiceIO implements ServiceIO {
  readonly rawBody: any = {};
  deepChat: DeepChat;
  validateConfigKey = false;
  canSendMessage: ValidateInput = BaseServiceIO.canSendMessage;
  requestSettings: Request = {};
  fileTypes: ServiceFileTypes = {};
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  totalMessagesMaxCharLength?: number;
  maxMessages?: number;
  addMessage?: (data: ResponseI) => void;
  demo?: DemoT;
  // these are placeholders that are later populated in submitButton.ts
  completionsHandlers: CompletionsHandlers = {} as CompletionsHandlers;
  streamHandlers: StreamHandlers = {} as StreamHandlers;

  constructor(deepChat: DeepChat, existingFileTypes?: ServiceFileTypes, demo?: DemoT) {
    this.deepChat = deepChat;
    this.demo = demo;
    Object.assign(this.rawBody, deepChat.request?.additionalBodyProps);
    this.totalMessagesMaxCharLength = deepChat?.requestBodyLimits?.totalMessagesMaxCharLength;
    this.maxMessages = deepChat?.requestBodyLimits?.maxMessages;
    SetFileTypes.set(deepChat, this, existingFileTypes);
    if (deepChat.request) this.requestSettings = deepChat.request;
    if (this.demo) this.requestSettings.url ??= Demo.URL;
    if (this.requestSettings.websocket) Websocket.setup(this);
  }

  private static canSendMessage(text?: string, files?: File[], isProgrammatic?: boolean) {
    if (isProgrammatic) return true;
    return !!(text && text.trim() !== '') || !!(files && files.length > 0);
  }

  verifyKey(_key: string, _keyVerificationHandlers: KeyVerificationHandlers) {}

  private static createCustomFormDataBody(body: any, messages: MessageContentI[], files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    let textMessageIndex = 0;
    messages.slice(0, messages.length - 1).forEach((message) => {
      formData.append(`message${(textMessageIndex += 1)}`, JSON.stringify(message));
    });
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.text) {
      delete lastMessage.files; // no need to have files prop as we are sending the message
      formData.append(`message${(textMessageIndex += 1)}`, JSON.stringify(lastMessage));
    }
    return formData;
  }

  private getServiceIOByType(file: File) {
    if (file.type.startsWith('audio') && this.fileTypes.audio) {
      return this.fileTypes.audio;
    }
    if (file.type.startsWith('image')) {
      if (this.fileTypes.gifs && file.type.endsWith('/gif')) return this.fileTypes.gifs;
      if (this.fileTypes.images) return this.fileTypes.images;
      if (this.camera) return this.camera;
    }
    return this.fileTypes.mixedFiles;
  }

  private async request(body: any, messages: Messages, stringifyBody = true) {
    // use actual stream if demo or when simulation prop not set
    const {stream} = this.deepChat;
    if (stream && this.demo && !Stream.isSimulation(stream)) {
      return Stream.request(this, body, messages);
    }
    return HTTPRequest.request(this, body, messages, stringifyBody);
  }

  async callServiceAPI(messages: Messages, pMessages: MessageContentI[], _?: File[]) {
    const body = {messages: pMessages, ...this.rawBody};
    let tempHeaderSet = false; // if the user has not set a header - we need to temporarily set it
    if (!this.requestSettings.headers?.['Content-Type']) {
      this.requestSettings.headers ??= {};
      this.requestSettings.headers['Content-Type'] ??= 'application/json';
      tempHeaderSet = true;
    }
    await this.request(body, messages);
    if (tempHeaderSet) delete this.requestSettings.headers?.['Content-Type'];
  }

  async callApiWithFiles(body: any, messages: Messages, pMessages: MessageContentI[], files: File[]) {
    const formData = BaseServiceIO.createCustomFormDataBody(body, pMessages, files);
    const previousRequestSettings = this.requestSettings;
    const fileIO = this.getServiceIOByType(files[0]);
    this.requestSettings = fileIO?.request || this.requestSettings;
    await this.request(formData, messages, false);
    this.requestSettings = previousRequestSettings;
  }

  // prettier-ignore
  async callAPI(requestContents: RequestContents, messages: Messages) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const processedMessages = MessageLimitUtils.processMessages(
      messages.messages, this.maxMessages, this.totalMessagesMaxCharLength);
    if (this.requestSettings.websocket) {
      const body = {messages: processedMessages, ...this.rawBody};
      Websocket.sendWebsocket(this, body, messages, false);
    } else if (requestContents.files && !this.isDirectConnection()) {
      this.callApiWithFiles(this.rawBody, messages, processedMessages, requestContents.files);
    } else {
      this.callServiceAPI(messages, processedMessages, requestContents.files);
    }
  }

  // WORK - validation to say that the response should have text, files or error property, link to example
  // and responseInterceptor
  async extractResultData(result: any | Response): Promise<Response | {makingAnotherRequest: true}> {
    if (result.error) throw result.error;
    if (result.result) return Legacy.handleResponseProperty(result);
    return result;
  }

  public isDirectConnection() {
    return false;
  }

  public isWebModel() {
    return false;
  }
}
