import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {History} from '../../views/chat/messages/history/history';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {ValidateInput} from '../../types/validateInput';
import {MessageLimitUtils} from './messageLimitUtils';
import {Stream as StreamI} from '../../types/stream';
import {Websocket} from '../../utils/HTTP/websocket';
import {Legacy} from '../../utils/legacy/legacy';
import {Stream} from '../../utils/HTTP/stream';
import {Demo as DemoT} from '../../types/demo';
import {Response} from '../../types/response';
import {Connect} from '../../types/connect';
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
  validateKeyProperty = false;
  canSendMessage: ValidateInput = BaseServiceIO.canSendMessage;
  connectSettings: Connect = {};
  fileTypes: ServiceFileTypes = {};
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  totalMessagesMaxCharLength?: number;
  maxMessages?: number;
  demo?: DemoT;
  stream?: StreamI;
  // these are placeholders that are later populated in submitButton.ts
  completionsHandlers: CompletionsHandlers = {} as CompletionsHandlers;
  streamHandlers: StreamHandlers = {} as StreamHandlers;

  constructor(deepChat: DeepChat, existingFileTypes?: ServiceFileTypes, demo?: DemoT) {
    this.deepChat = deepChat;
    this.demo = demo;
    Object.assign(this.rawBody, deepChat.connect?.additionalBodyProps);
    this.totalMessagesMaxCharLength = deepChat?.requestBodyLimits?.totalMessagesMaxCharLength;
    this.maxMessages = deepChat?.requestBodyLimits?.maxMessages;
    SetFileTypes.set(deepChat, this, existingFileTypes);
    if (deepChat.connect) this.connectSettings = deepChat.connect;
    if (this.demo) this.connectSettings.url ??= Demo.URL;
    if (this.connectSettings.websocket) Websocket.setup(this);
    this.stream = this.deepChat.connect?.stream || Legacy.checkForStream(this.deepChat);
    if (deepChat.loadHistory) History.addErrorPrefix(this);
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
    if (this.stream && !Stream.isSimulation(this.stream)) {
      return Stream.request(this, body, messages, stringifyBody);
    }
    return HTTPRequest.request(this, body, messages, stringifyBody);
  }

  private async callAPIWithText(messages: Messages, pMessages: MessageContentI[]) {
    const body = {messages: pMessages, ...this.rawBody};
    let tempHeaderSet = false; // if the user has not set a header - we need to temporarily set it
    if (!this.connectSettings.headers?.['Content-Type']) {
      this.connectSettings.headers ??= {};
      this.connectSettings.headers['Content-Type'] ??= 'application/json';
      tempHeaderSet = true;
    }
    await this.request(body, messages);
    if (tempHeaderSet) delete this.connectSettings.headers?.['Content-Type'];
  }

  private async callApiWithFiles(messages: Messages, pMessages: MessageContentI[], files: File[]) {
    const formData = BaseServiceIO.createCustomFormDataBody(this.rawBody, pMessages, files);
    const previousConnectSettings = this.connectSettings;
    const fileIO = this.getServiceIOByType(files[0]);
    this.connectSettings = fileIO?.connect || this.connectSettings;
    await this.request(formData, messages, false);
    this.connectSettings = previousConnectSettings;
  }

  async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    if (files) {
      this.callApiWithFiles(messages, pMessages, files);
    } else {
      this.callAPIWithText(messages, pMessages);
    }
  }

  // prettier-ignore
  async callAPI(requestContents: RequestContents, messages: Messages) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const processedMessages = MessageLimitUtils.processMessages(
      messages.messages, this.maxMessages, this.totalMessagesMaxCharLength);
    if (this.connectSettings.websocket) {
      const body = {messages: processedMessages, ...this.rawBody};
      Websocket.sendWebsocket(this, body, messages, false);
    } else {
      this.callServiceAPI(messages, processedMessages, requestContents.files);
    }
  }

  async extractResultData(result: any | Response): Promise<Response | {makingAnotherRequest: true}> {
    if (result.error) throw result.error;
    if (result.result) return Legacy.handleResponseProperty(result);
    // if invalid - process later in HTTPRequest.request
    if (!RequestUtils.validateResponseFormat(result)) return undefined as unknown as Response;
    return result;
  }

  public isDirectConnection() {
    return false;
  }

  public isWebModel() {
    return false;
  }
}
