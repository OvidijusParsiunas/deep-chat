import {CohereCompletionsResult, CohereSummarizeResult} from '../../types/cohereResult';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO} from '../serviceIO';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {CohereGenerateConfig, CohereSummarizeConfig} from '../../types/cohere';
import {RequestSettings, ServiceCallConfig} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {InterfacesUnion} from '../../types/utilityTypes';
import {MessageContent} from '../../types/messages';
import {CohereUtils} from './utils/cohereUtils';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

type Body = InterfacesUnion<CohereGenerateConfig | CohereSummarizeConfig>;

type TextResult = InterfacesUnion<CohereCompletionsResult | CohereSummarizeResult>;

// completions and summarize combined
export class CohereTextIO implements ServiceIO {
  placeholderText: string;
  url: string;
  canSendMessage: ValidateMessageBeforeSending = CohereTextIO.canSendMessage;
  private readonly _raw_body: Body = {};
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;
  private readonly _isSummarize: boolean;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {cohere, validateMessageBeforeSending} = aiAssistant;
    this._isSummarize = !!cohere?.summarize;
    const config = cohere?.summarize || cohere?.textGeneration;
    if (typeof config === 'object') {
      // Completions with no max_tokens behave weirdly and do not give full responses
      // Client should specify their own max_tokens.
      this.requestSettings = key ? CohereUtils.buildRequestSettings(key, config.request) : config.request;
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
    }
    const requestSettings = typeof config === 'object' ? config.request : undefined;
    if (key) this.requestSettings = key ? CohereUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    if (typeof config === 'object') this.cleanConfig(config);
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    this.url = this._isSummarize ? 'https://api.cohere.ai/v1/summarize' : 'https://api.cohere.ai/v1/generate';
    this.placeholderText = this._isSummarize ? 'Insert text to summarize' : 'Once upon a time';
  }

  private cleanConfig(config: ServiceCallConfig) {
    delete config.request;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private static canSendMessage(text: string) {
    return text.trim() !== '';
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = CohereUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    CohereUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  private preprocessBody(body: Body, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    if (this._isSummarize) return {text: mostRecentMessageText, ...bodyCopy};
    return {prompt: mostRecentMessageText, ...bodyCopy};
  }

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }

  async extractResultData(result: TextResult): Promise<Result> {
    if (result.message) throw result.message;
    if (this._isSummarize) return {text: result.summary || ''};
    return {text: result.generations?.[0].text || ''};
  }
}
