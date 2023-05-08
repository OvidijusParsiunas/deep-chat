import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO} from '../serviceIO';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RequestSettings, ServiceCallConfig} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HuggingFaceUtils} from './utils/huggingFaceUtils';
import {HuggingFaceModel} from '../../types/huggingFace';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {AiAssistant} from '../../aiAssistant';

type HuggingFaceServiceConfigObj = {parameters?: object; options?: object; context?: string};

type HuggingFaceServiceConfig = true | (HuggingFaceModel & HuggingFaceServiceConfigObj & ServiceCallConfig);

export class HuggingFaceIO<T extends HuggingFaceServiceConfigObj> implements ServiceIO {
  private static readonly URL_PREFIX = 'https://api-inference.huggingface.co/models/';
  introPanelMarkUp = `
  <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
  <p>First message may take an extented amount of time to complete as the model needs to be initialized.</p>`;

  url: string;
  placeholderText: string;
  canSendMessage: ValidateMessageBeforeSending = HuggingFaceIO.canSendMessage;
  private readonly _raw_body: T = {} as T;
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, placeholderText: string, defaultModel: string,
      config: HuggingFaceServiceConfig, key?: string) {
    const {validateMessageBeforeSending} = aiAssistant;
    this.url = `${HuggingFaceIO.URL_PREFIX}${defaultModel}`;
    this.placeholderText = placeholderText;
    if (typeof config === 'object') {
      this.requestSettings = key ? HuggingFaceUtils.buildRequestSettings(key, config.request) : config.request;
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
      if (config.model) this.url = `${HuggingFaceIO.URL_PREFIX}${config.model}`;
      if (config.options) this._raw_body.options = config.options;
      if (config.parameters) this._raw_body.parameters = config.parameters;
    }
    const requestSettings = typeof config === 'object' ? config.request : undefined;
    if (key) this.requestSettings = key ? HuggingFaceUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    if (typeof config === 'object') this.cleanConfig(config);
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  private cleanConfig(config: HuggingFaceModel & ServiceCallConfig) {
    delete config.model;
    delete config.request;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private static canSendMessage(text: string) {
    return text.trim() !== '';
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = HuggingFaceUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    HuggingFaceUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  // prettier-ignore
  preprocessBody(body: HuggingFaceServiceConfigObj, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as (HuggingFaceServiceConfigObj
      & {options?: {wait_for_model?: boolean}});
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    bodyCopy.options ??= {};
    bodyCopy.options.wait_for_model = true;
    return {inputs: mostRecentMessageText, ...bodyCopy};
  }

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages) as object;
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }
}
